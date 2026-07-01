import NavBar from "@/components/Nav/NavBar";
import { Outlet } from "react-router-dom";

export default function Layout(){
    return (
        <div className="flex md:flex-row h-screen w-screen flex-col">
            <NavBar></NavBar>
            <Outlet></Outlet>
        </div>
    );
}
