import { useState } from "react";
import Main from "../components/Dashboard/Main";
import Sidebar from "../components/Dashboard/Sidebar";
import type{user} from "../type/user"

export default function Dashboard() {
    const [rUser, setRUser] = useState<user | undefined>(undefined);    
    const setUser = (u : user) => {
        setRUser(u);
    }
    return (
            <div 
                className="flex h-screen w-full bg-background text-foreground overflow-hidden"
            >
                <Sidebar sendUser={setUser}></Sidebar>
                <Main rUser={rUser}></Main>
            </div>
    );
}
