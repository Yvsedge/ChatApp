import { useState } from "react";
import Main from "../components/Dashboard/Main";
import Sidebar from "../components/Dashboard/Sidebar";

type Props = {
};

export default function Dashboard({}: Props) {
    const [rid, setRid] = useState("");    
    const setId = (rid : string) => {
        setRid(rid);
    }
    return (
            <div 
                className="flex h-full w-full bg-background text-foreground"
            >
                <Sidebar sendID={setId}></Sidebar>
                <Main rId={rid}></Main>
            </div>
    );
}
