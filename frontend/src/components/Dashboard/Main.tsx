import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";

type Props = {
    rId : string,
};

type Message = {
    id : string,
    sender_id: string,
    receiver_id: string,
    content: string,
    created_at: string
}
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
useEffect
const fetchMessages = async(rId : string) : Promise<response> => {
    const token = localStorage.getItem('token');
    const res = await fetch(
        `http://localhost:3000/message/${rId}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if(!res.ok){
        throw new Error("Failed to fetch");
    }
    

    return res.json();
}

export default function Main({rId}: Props) {

    const [content, SetContent] = useState("");

    const {data, isLoading, error} = useQuery<response>({
        queryKey: ["messages", rId],
        queryFn: () => fetchMessages(rId),
        enabled: !!rId,
    });

    const msgs = data?.message ?? [];

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [msgs]);

    const queryClient = useQueryClient();

    const sendMessage = useMutation({
        mutationFn: async ({mess, rid} : q) : Promise<msg> => {
            const token = localStorage.getItem('token');
            console.log(JSON.stringify(mess));
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
        onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ["messages", rId],
        });

        SetContent("");
        }
    })

    const currId = localStorage.getItem("id");

    if(isLoading) return(<h1>Loading...</h1>)
    if(error) return(<h1>Error</h1>)  

    const handleSubmit = async (e : React.SubmitEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        const obj : Message = {
            id : crypto.randomUUID(),
            sender_id: currId ?? "",
            receiver_id: rId,
            content: content,
            created_at: ""
        };
        await sendMessage.mutateAsync({mess: obj, rid: rId});

        SetContent("");
    }
    if (!rId) {
    return (
            <main className="flex items-center justify-center h-full">
                <h2>Select a user to start chatting</h2>
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Messages — scrollable, fills space */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
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
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {new Date(m.created_at).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </p>
                                <div ref={bottomRef}/>
                            </div>
                        );
                    })
                }
            </div >

            {/* Input — pinned to bottom */}
            <form 
                onSubmit={handleSubmit}
                className="flex gap-2 px-4 py-3 border-t border-border bg-card shrink-0"
            >
                <input
                    type="text"
                    value={content}
                    onChange={e => SetContent(e.currentTarget.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                    Send
                </button>
            </form>
        </main>
    );
}
