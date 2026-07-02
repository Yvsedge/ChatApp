import { socket } from "@/socket/socket";
import type { user } from "@/type/user";
import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { Message, response } from "@/type/message";
import { Loader2, SendHorizonal } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import * as emoji from 'node-emoji'

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

export default function ChatInput({rUser}: Props) {

    const [content, setContent] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTyping = useRef(false);
    const queryClient = useQueryClient();
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [rUser.id]);
    
    useEffect(() => {
    const handleClick = (e: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target as Node)
            ) {
                setShowPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener("mousedown", handleClick);
    }, []);
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

            queryClient.setQueryData<res>(["userlist"], old => {
                if (!old) return old;

                return {
                    users: old.users.map(user =>
                        user.id === rUser.id
                            ? {
                                ...user,
                                content: mess.content,
                                created_at: new Date().toISOString(),
                            }
                            : user
                    )
                };
            });

            return {previousMessage};
        },
        onSuccess: () => {
            setContent("");
            if (inputRef.current) {
                inputRef.current.style.height = "0px";
                setTimeout(() => inputRef.current?.focus(), 0);
            }
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

        const finalContent = emoji.emojify(content);

        const obj : Message = {
            id : crypto.randomUUID(),
            sender_id: currId ?? "",
            receiver_id: rUser?.id ?? "",
            content: finalContent,
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
    const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as never);
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit} className="border-t border-border bg-card p-3">
                <div className="flex gap-2 items-end rounded-2xl border border-border bg-surface-secondary px-3 py-2 focus-within:border-primary transition-colors">
                    
                    {/* Emoji */}
                    <div className="relative shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowPicker(prev => !prev)}
                            className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-surface transition-colors"
                        >
                            <Smile size={20} />
                        </button>
                        {showPicker && (
                            <div ref={pickerRef} className="absolute bottom-12 left-0 z-50">
                                <EmojiPicker
                                    onEmojiClick={(emoji) => {
                                        setContent(prev => prev + emoji.emoji);
                                        setShowPicker(false);
                                        inputRef.current?.focus();
                                    }}
                                    theme={Theme.DARK}
                                />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <textarea
                        value={content}
                        autoFocus
                        onChange={e => {
                                handleChange(emoji.emojify(e.currentTarget.value))
                                if (inputRef.current) {
                                    inputRef.current.style.height = "0px";
                                    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
                                }
                            }}
                        placeholder="Type a message..."
                        ref={inputRef}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        className="flex-1 self-center bg-transparent resize-none border-none outline-none shadow-none leading-6 max-h-32 overflow-y-auto py-1 text-sm focus:ring-primary"
                    />

                    {/* Send */}
                    <button
                        type="submit"
                        disabled={!content.trim() || sendMessage.isPending}
                        className="shrink-0 flex items-center justify-center w-9 h-9 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 transition-all hover:opacity-90"
                    >
                        {sendMessage.isPending
                            ? <Loader2 size={18} className="animate-spin" />
                            : <SendHorizonal size={18} />
                        }
                    </button>

                </div>
            </form>
        </>
    );
}
