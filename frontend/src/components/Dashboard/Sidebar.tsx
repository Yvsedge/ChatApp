import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type{user} from "../../type/user"
import { getUsers } from "@/apis/getUser";
import { errortoast } from "../ToastNotifications/notifications";
type Props = {
    sendUser : (u : user) => void;
};

export default function Sidebar({ sendUser }: Props) {
    const [searchTerm, SetSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const { data, isLoading, error } = useQuery({
        queryKey: ["userlist"],
        queryFn: getUsers
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const userList = data?.users ?? [];
    const filtereduserList = userList.filter(
        user => 
            (user.firstname + " " + user.lastname).toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    const handleSelect = (u : user) => {
        sendUser(u);
        setSelectedUser(u.id);
    }

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("id");

        queryClient.clear();

        navigate("/Login");
    };

    if (isLoading) {
        return (
            <aside className="h-full w-80 border-r border-border bg-card p-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 py-3 animate-pulse"
                    >
                        <div className="w-10 h-10 rounded-full bg-surface-secondary" />

                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-4 w-32 rounded bg-surface-secondary" />
                            <div className="h-3 w-48 rounded bg-surface-secondary" />
                        </div>
                    </div>
                ))}
            </aside>
        );
    }

    if(error){
        errortoast("Error");
    } 

    return (
        <aside className="h-full w-80 flex flex-col border-r border-border bg-card shrink-0">
            <div className="flex flex-col px-4 py-4 border-b border-border gap-2">
                <h2 className="text-foreground font-semibold text-sm">Messages</h2>
                <input 
                    type="text" 
                    name="searchname" 
                    id="searchname" 
                    value={searchTerm}
                    className="flex-1 bg-surface-secondary border border-border rounded-lg px-4 py-1 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Search Users"
                    onChange={e => SetSearchTerm(e.currentTarget.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <p className="text-muted-foreground text-sm px-4 py-3">Loading...</p>
                )}
                {error && (
                    <p className="text-error text-sm px-4 py-3">Failed to load users</p>
                )}
                {filtereduserList.map(u => (
                    <button
                        key={u.id}
                        onClick={() => handleSelect(u)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors text-left border-b border-border cursor-pointer ${selectedUser === u.id && "bg-surface-secondary border-l-4 border-l-primary"}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-xs font-semibold">
                                {(u.firstname[0] + (u.lastname[0] ?? "")).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-foreground text-sm font-medium truncate">
                                {u.firstname} {u.lastname}
                            </span>
                            <span className="text-muted-foreground text-xs truncate">
                                {u.email}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="px-4 h-[57px] border-t border-border mt-auto flex justify-center items-center">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                >
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
}
