import { socket } from "@/socket/socket";
import type { user } from "@/type/user";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Message, response } from "@/type/message";
import { SendHorizonal } from "lucide-react";

type Props = {
    rUser: user
};

type msg = {
    content : string
}

type q = {
    mess : Message,
    rid : string
}

export default function ChatInput({rUser}: Props) {

    const [content, setContent] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTyping = useRef(false);
    const queryClient = useQueryClient();
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
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
                queryKey: ["messages", rUser.id]
            });

            const previousMessage = queryClient.getQueryData<response>([
                "messages",
                rUser.id
            ]);

            queryClient.setQueryData(
                ["messages", rUser.id],
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
    const handleChange = (value: string) => {   
            setContent(value);

            if (!isTyping.current) {
                socket.emit("typing", {
                    senderId: currId,
                    receiverId: rUser?.id,
                });

                isTyping.current = true;
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", {
                    senderId: currId,
                    receiverId: rUser?.id,
                });

                isTyping.current = false;
            }, 1000);
    };
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

        const id = localStorage.getItem("id");
        socket.emit("stop_typing", {
            senderId: id,
            receiverId: rUser?.id,
        });
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        isTyping.current = false;
    }
    return (
        <>
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
        </>
    );
}
