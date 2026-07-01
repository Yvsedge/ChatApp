import { socket } from "@/socket/socket";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, MessageCircle, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function NavBar() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const handleLogout = () => {
        socket.disconnect();

        localStorage.removeItem("token");
        localStorage.removeItem("id");

        queryClient.clear();

        navigate("/Login");
    };

    return (
            <div
                className="order-last md:order-none md:h-full md:w-14 h-14 w-full bg-surface-secondary border border-border flex md:flex-col flex-row justify-between items-center py-5 px-2"
            >
                <NavLink 
                    to="/"
                    className={({ isActive }) =>
                        isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }
                >
                    <MessageCircle className="hover:bg-surface-secondary transition-colors"/>
                </NavLink>
                <div className="flex md:flex-col flex-row gap-3">
                    <NavLink 
                        to="/Profile"
                        className={({ isActive }) =>
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }
                    >
                        <UserRound className="hover:bg-surface-secondary transition-colors"/>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="rounded-lg text-sm text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    >
                        <LogOut className="hover:bg-surface-secondary transition-colors"/>
                    </button>
                </div>
            </div>
    )
}

