import { fetchMessages} from "@/apis/message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import type{user} from "../../type/user"
import type{Message} from "../../type/message"
import { SendHorizonal } from "lucide-react";
import { errortoast } from "../ToastNotifications/notifications";
import { socket } from "../../socket/socket";
import {usePresense} from "@/hook/usePresense" 
type Props = {
    rUser : user | undefined,
};
type response = {
    message : Message[],
}
type msg = {
    content : string
}

type q = {
    mess : Message,
    rid : string
}

type special = {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    content: string,
    created_at: string
}

type res = {
    users: special[]
}


export default function Main({rUser}: Props) {

    const {typingUsers} = usePresense();

    const [content, setContent] = useState("");
    const isTyping = useRef(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {data, isLoading, error} = useQuery<response>({
        queryKey: ["messages", rUser?.id],
        queryFn: () => fetchMessages(rUser?.id ?? ""),
        enabled: !!rUser?.id,
    });

    const msgs = data?.message ?? [];

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();


    useEffect(() => {
    }, [])

    useEffect(() => {
        if (rUser) {
            inputRef.current?.focus();
        }

        const handleReceive = (obj: Message) => {
            queryClient.setQueryData(
                ["messages", obj.sender_id],
                (old: response | undefined) => ({
                    message: [
                        ...(old?.message ?? []),
                        obj
                    ]
                })
            );
            const currId = localStorage.getItem("id");
            const otherUserId =
                obj.sender_id === currId
                    ? obj.receiver_id
                    : obj.sender_id;
            queryClient.setQueryData<res>(
                ["userlist"],
                (old) => {
                    if (!old) return old;

                    const users = old.users.map((user) =>
                        user.id === otherUserId
                            ? {
                                ...user,
                                content: obj.content,
                                created_at: obj.created_at,
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
        socket.on('receiver_message', handleReceive);

        return () => {
            socket.off("receiver_message", handleReceive);
        }
    }, [queryClient, rUser]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [msgs]);



    const sendMessage = useMutation({
        mutationFn: async ({mess, rid} : q) : Promise<msg> => {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:3000/message/send/${rid}`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(mess)
                }
            )

            if (!res.ok) {
                    throw new Error();
            }

            return res.json();
        },
        onMutate: async ({mess}) => {
            await queryClient.cancelQueries({
                queryKey: ["messages", rUser?.id]
            });

            const previousMessage = queryClient.getQueryData<response>([
                "messages",
                rUser?.id
            ]);

            queryClient.setQueryData(
                ["messages", rUser?.id],
                (old : response) => ({
                    message: [
                        ...(old?.message ?? []),
                        mess
                    ]
                })
            );

            return {previousMessage};
        },
        onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ["messages", rUser?.id],
        });

        setContent("");
        },

        onError: (_,__,context) => {
            queryClient.setQueryData(
                ["messages", rUser?.id],
                context?.previousMessage
            );
        },

        onSettled() {
            queryClient.invalidateQueries({
                queryKey: ["messages", rUser?.id]
            });
        }
    })

    const currId = localStorage.getItem("id");

    if(isLoading){
        return (
        <main className="h-full flex-1 flex flex-col overflow-hidden min-h-0">

            {/*User Profile*/}
            <div
                className="flex flex-col p-4 bg-surface-secondary border-b border-border"
            >
                <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs font-semibold">
                        </span>
                    </div>
                    <p></p>
                </div>
            </div>
            
            {/* Messages — scrollable, fills space */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 min-h-0">
                <div className="flex-grow" />
                {[...Array(6)].map((_, i) => {
                        return (
                            <div key={i} className={`flex ${i%2 ? "justify-end" : "justify-start"}`}>
                                <p className={`
                                    rounded-2xl px-4 py-2 max-w-[65%] text-foreground text-sm
                                    flex justify-center items-center gap-1 bg-bubble-received border border-border animate-pulse`
                                    }
                                    >
                                </p>
                            </div>
                        );
                    })
                }
                <div ref={bottomRef}/>
            </div >

            {/* Input — pinned to bottom */}
            <div 
                className="flex gap-2 px-4 h-[57px] border-t border-border bg-card shrink-0 justify-center items-center animate-pulse"
            >
                <input
                    className="flex-1 bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary animate-pulse"
                />
                <button
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity animate-pulse"
                >
                    <SendHorizonal/>
                </button>
            </div>
        </main>
        );
    }

    if(error){errortoast("Error")};

    const handleSubmit = async (e : React.SubmitEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        const obj : Message = {
            id : crypto.randomUUID(),
            sender_id: currId ?? "",
            receiver_id: rUser?.id ?? "",
            content: content,
            created_at: ""
        };
        await sendMessage.mutateAsync({mess: obj, rid: rUser?.id ?? ""});

        setContent("");
        const id = localStorage.getItem("id");
        socket.emit("stop_typing", {
            senderId: id,
            receiverId: rUser?.id,
        });
    }

    const handleChange = (value: string) => {   
        setContent(value);
        const id = localStorage.getItem("id");

        if (!isTyping.current) {
            socket.emit("typing", {
                senderId: id,
                receiverId: rUser?.id,
            });

            isTyping.current = true;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            socket.emit("stop_typing", {
                senderId: id,
                receiverId: rUser?.id,
            });

            isTyping.current = false;
        }, 1000);
    };

    if (rUser === undefined) {
    return (
            <main className="flex-1 flex justify-center">
                <h2>Select a user to start chatting</h2>
            </main>
        );
    }


    return (
        <main className="h-full flex-1 flex flex-col overflow-hidden min-h-0">

            {/*User Profile*/}
            <div
                className="flex flex-col p-4 bg-surface-secondary border-b border-border"
            >
                <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs font-semibold">
                            {(rUser.firstname[0] + (rUser.lastname[0] ?? "")).toUpperCase()}
                        </span>
                    </div>
                    <p className="flex flex-col">
                        <span>{`${rUser.firstname} ${rUser.lastname}`}</span>
                        <span className="text-muted-foreground text-xs truncate ">{typingUsers.has(rUser?.id) && "...is Typing"}</span>
                    </p>
                </div>
            </div>
            
            {/* Messages — scrollable, fills space */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 min-h-0">
                <div className="flex-grow" />
                {msgs.length === 0 
                    ? <p className="text-muted-foreground text-sm text-center mt-4">No messages yet</p>
                    : msgs.filter(m => m.content.trim() !== "").map(m => {
                        const isMine = m.sender_id === currId;
                        return (
                            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <p className={`
                                    rounded-2xl px-4 py-2 max-w-[65%] text-foreground text-sm
                                    flex justify-center items-center gap-1
                                    ${isMine 
                                        ? "bg-bubble-sent" 
                                        : "bg-bubble-received border border-border"}
                                `}>
                                    {m.content}
                                    <span className="text-xs text-muted-foreground mt-5">
                                        {new Date(m.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </p>
                            </div>
                        );
                    })
                }
                <div ref={bottomRef}/>
            </div >

            {/* Input — pinned to bottom */}
            <form 
                onSubmit={handleSubmit}
                className="flex gap-2 px-4 h-[57px] border-t border-border bg-card shrink-0 justify-center items-center"
            >
                <input
                    type="text"
                    value={content}
                    onChange={e => handleChange(e.currentTarget.value)}
                    placeholder="Type a message..."
                    ref={inputRef}
                    className="flex-1 bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sendMessage.isPending}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                    <SendHorizonal/>
                </button>
            </form>
        </main>
    );
}
