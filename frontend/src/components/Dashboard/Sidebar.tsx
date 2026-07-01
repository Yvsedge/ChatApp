import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type{user} from "@/type/user"
import { getUsers } from "@/apis/getUser";
import { errortoast } from "../ToastNotifications/notifications";
import {usePresense} from "@/hook/usePresense" 

type Props = {
    sendUser : (u : user) => void;
};

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

export default function Sidebar({ sendUser }: Props) {
    const queryClient = useQueryClient();
    const [searchTerm, SetSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const {onlineUsers, typingUsers} = usePresense();

    const { data, isLoading, error } = useQuery({
        queryKey: ["userlist"],
        queryFn: getUsers
    });
    useEffect(() => {
        if (error) {
            errortoast("Error");
        }
    }, [error]);

    const userList = data?.users ?? [];
    const filtereduserList = userList.filter(
        user => 
            (user.firstname + " " + user.lastname).toLowerCase().includes(searchTerm.trim().toLowerCase())
    )

    const handleSelect = (u : user) => {
        sendUser(u);
        setSelectedUser(u.id);
        queryClient.setQueryData<res>(
            ["userlist"],
            old => {
                if (!old) return old;

                return {
                    users: old.users.map(user =>
                        user.id === u.id
                            ? {
                                ...user,
                                unread_count: 0,
                            }
                            : user
                    )
                };
            }
        );
    }


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

    return (
        <aside className="h-full md:w-80 w-full flex flex-col border-r border-border bg-card shrink-0">

            <div className="flex flex-col h-full">
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
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                                    <span className="text-primary-foreground text-xs font-semibold">
                                        {(u.firstname[0] + (u.lastname[0] ?? "")).toUpperCase()}
                                    </span>
                                </div>
                                    {onlineUsers.includes(u.id) && (
                                        <div className="absolute bottom-0 right-0
                                                        w-3 h-3 rounded-full
                                                        bg-green-500 border-2 border-card"/>
                                    )}
                            </div>
                            <div className="flex flex-col w-full">
                                <span className="text-foreground text-sm font-medium truncate">
                                    {u.firstname} {u.lastname}
                                </span>
                                <div className="flex justify-between w-full">
                                    <span className="text-muted-foreground text-xs truncate flex items-center gap-2">
                                            {typingUsers.has(u.id)
                                                    ? "Typing..."
                                                    : u.content ?? "Start a conversation"}
                                            <span className="text-xs text-muted-foreground">
                                                {u.created_at
                                                    ? new Date(u.created_at).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : ""}
                                            </span>
                                    </span>
                                    <span className="text-muted-foreground text-xs truncate flex items-center gap-2">
                                        {u.unread_count > 0 && (
                                            <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                                                {u.unread_count}
                                            </span> 
                                        )}
                                    </span>
                                </div>
                                <span className="text-muted-foreground text-xs truncate flex items-center gap-2">
                                    
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
