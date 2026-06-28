import { socket } from "@/socket/socket";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedLayer( {children,}: {children: React.ReactNode;} ) {
    const token = localStorage.getItem("token");
    useEffect(() => {
    const id = localStorage.getItem("id");

    if (id) {
        socket.emit("join", id);
    }
}, []);
    if(!token){
        return <Navigate to="/Login" replace/>
    }
    return children;
}
