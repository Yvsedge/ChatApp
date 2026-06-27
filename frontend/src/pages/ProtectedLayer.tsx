import { Navigate } from "react-router-dom";

export default function ProtectedLayer( {children,}: {children: React.ReactNode;} ) {
    const token = localStorage.getItem("token");
    if(!token){
        return <Navigate to="/Login" replace/>
    }
    return children;
}
