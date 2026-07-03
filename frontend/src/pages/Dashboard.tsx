import { useEffect, useState } from "react";
import Main from "@/components/Dashboard/Main";
import Sidebar from "@/components/Dashboard/Sidebar";
import type{user} from "@/type/user"
import { socket } from "@/socket/socket";
import { PresenseContext } from "@/context/presenseContext";
import { useQueryClient } from "@tanstack/react-query";
import type { Message, response } from "@/type/message";

type special = {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    content: string,
    created_at: string,
    unread_count: number,
}

type res = {
    users: special[]
}



export default function Dashboard() {
    const [rUser, setRUser] = useState<user | undefined>(undefined);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);    
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set); 
    const queryClient = useQueryClient();
    const MOBILE_BREAKPOINT = 768;

        useEffect(() => {
            const handleReceive = (obj: Message) => {
                const currId = localStorage.getItem("id");
                const otherUserId =
                    obj.sender_id === currId
                        ? obj.receiver_id
                        : obj.sender_id;
                queryClient.setQueryData(
                    ["messages", otherUserId],
                    (old: response | undefined) => ({
                        message: [
                            ...(old?.message ?? []),
                            obj
                        ]
                    })
                );
                queryClient.setQueryData<res>(
                    ["userlist"],
                    (old) => {
                        if (!old) return old;

                        const currId = localStorage.getItem("id");

                        const isIncoming = obj.receiver_id === currId;
                        const users = old.users.map((user) =>
                            user.id === otherUserId
                                ? {
                                    ...user,
                                    content: obj.content,
                                    created_at: obj.created_at,
                                    unread_count:
                                    !isIncoming
                                        ? user.unread_count
                                        : user.id === rUser?.id
                                            ? 0
                                            : user.unread_count + 1,
                                }
                                : user
                        );

                        return {
                            ...old,
                            users,
                        };
                    }
                );
            };

            const handleDelete = ({
                                    id,
                                    senderId,
                                    receiverId,
                                }: {
                                    id: string;
                                    senderId: string;
                                    receiverId: string;
                                }) => {
                const currentUser = rUser?.id;

                if (
                    senderId !== currentUser &&
                    receiverId !== currentUser
                ) {
                    return;
                }
                queryClient.setQueryData<response>(
                    ["messages", rUser?.id],
                    old => {
                        if (!old) return old;

                        return {
                            message: old.message.filter(m => m.id !== id),
                        };
                    }
                );
            }

            const handleUpdate = ({
                                    message,
                                    senderId,
                                    receiverId,
                                }: {
                                    message: Message;
                                    senderId: string;
                                    receiverId: string;
                                }) => {
                const currId = localStorage.getItem("id");

                const otherUser =
                    senderId === currId
                        ? receiverId
                        : senderId;

                if (otherUser !== rUser?.id) return;

                queryClient.setQueryData(
                    ["messages", otherUser],
                    (old : response) => {
                        if (!old) return old;

                        return {
                            message: old.message.map(m =>
                                m.id === message.id
                                    ? message
                                    : m
                            )
                        };
                    }
                );
            }

            const handleMessagesRead = ({ readerId }: { readerId: string }) => {
                const currId = localStorage.getItem("id");

                queryClient.setQueryData<response>(
                    ["messages", readerId],
                    old => {
                        if (!old) return old;

                        return {
                            message: old.message.map(msg =>
                                msg.sender_id === currId
                                    ? {
                                        ...msg,
                                        is_read: true,
                                    }
                                    : msg
                            ),
                        };
                    }
                );
            };

            socket.on('receiver_message', handleReceive);

            socket.on("message_deleted", handleDelete);

            socket.on("message_updated", handleUpdate);

            socket.on("messages_read", handleMessagesRead)

        return () => {
            socket.off("receiver_message", handleReceive);
            socket.off("message_deleted", handleDelete);
            socket.off("message_updated", handleUpdate);
            socket.off("messages_read", handleMessagesRead);
        }
    }, [queryClient, rUser]);

    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth < MOBILE_BREAKPOINT
    );

    useEffect(() => {
        const resize = () =>
            setIsMobile(window.innerWidth < 768);

        window.addEventListener("resize", resize);

        return () =>
            window.removeEventListener("resize", resize);
    }, []);
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

        socket.connect();

        socket.on("connect", join);

        if (socket.connected) {
            join();
        }

        return () => {
            socket.off("connect", join);
        };
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
            <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
                {isMobile ? (
                    rUser ? (
                        <Main
                            rUser={rUser}
                            onBack={() => setRUser(undefined)}
                            isMobile={isMobile}
                        />
                    ) : (
                        <Sidebar sendUser={setUser} />
                    )
                ) : (
                    <>
                        <Sidebar sendUser={setUser} />
                        <Main
                            rUser={rUser}
                            onBack={() => setRUser(undefined)}
                            isMobile={isMobile}
                        />
                    </>
                )}
            </div>
        </PresenseContext.Provider>
    );
}
