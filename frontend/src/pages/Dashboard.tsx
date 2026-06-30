import { useEffect, useState } from "react";
import Main from "@/components/Dashboard/Main";
import Sidebar from "@/components/Dashboard/Sidebar";
import type{user} from "@/type/user"
import { socket } from "@/socket/socket";
import { PresenseContext } from "@/context/presenseContext";



export default function Dashboard() {
    const [rUser, setRUser] = useState<user | undefined>(undefined);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);    
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set);  
    useEffect(() => {
        socket.on("online_users", (user : string[]) => {
            setOnlineUsers(user);
        });
        socket.on("typing", ({ senderId }) => {
            console.log("Received typing:", senderId);
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.add(senderId);
                return next;
            });
        });

        socket.on("stop_typing", ({ senderId }) => {
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(senderId);
                return next;
            });

    });
        return () => {
            socket.off("online_users");
            socket.off("typing");
            socket.off("stop_typing");
        }
    }, []);

    useEffect(() => {
        const id = localStorage.getItem("id");

        if (!id) return;

        const join = () => socket.emit("join", id);

        if (socket.connected) {
            join();
        } else {
            socket.once("connect", join);
            socket.connect();
        }

        return () => {socket.off("connect", join)};
    }, []);
    const setUser = (u : user) => {
        setRUser(u);
    }
    return (
        <PresenseContext.Provider
            value={{
                onlineUsers,
                typingUsers
            }}
        >
            <div 
                className="flex h-screen w-full bg-background text-foreground overflow-hidden"
            >
                <Sidebar sendUser={setUser}></Sidebar>
                <Main rUser={rUser}></Main>
            </div>
        </PresenseContext.Provider>
    );
}
