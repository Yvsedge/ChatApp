import type { Message, response } from "@/type/message";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/../@/components/ui/context-menu"
import { useRef, useState } from "react";
import { useMutation, useQueryClient, } from "@tanstack/react-query";
import type { user } from "@/type/user";

type delreq = {
    id : string,
    rid : string
}
type editreq = {
    id : string,
    rid : string,
    content: string
}

type Props = {
    m: Message,
    rUser: user,
};

export default function ChatBubble({m, rUser}: Props) {
    const [isEditing, setIsEditing] = useState("");
    const [updatedcontent, setUpdatedcontent] = useState("");
    const currId = localStorage.getItem("id");
    const isMine = m.sender_id === currId;
    const queryClient = useQueryClient();

    const editRef = useRef<HTMLInputElement>(null);

    const deleteMessage = useMutation({
        mutationFn: async ({id, rid} : delreq) : Promise<response> => {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:3000/message/${rid}`,{
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                                        id,
                                    })
                }
            )
            if(!res.ok){
                throw new Error();
            }

            return res.json();
        },
        onMutate: async({id}) => {
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
                    message: old?.message.filter(
                        m => m.id !== id
                    ) ?? []
                })
            );
            return {previousMessage};
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
            queryClient.invalidateQueries({
                queryKey: ["userlist"]
            });
        }
    })

    const editMessage = useMutation({
        mutationFn: async ({id, rid, content} : editreq) : Promise<response> => {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `http://localhost:3000/message/${rid}`,{
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                                        id,
                                        content
                                    })
                }
            )
            if(!res.ok){
                throw new Error();
            }

            return res.json();
        },
        onMutate: async({id, content}) => {
            await queryClient.cancelQueries({
                queryKey: ["messages", rUser?.id]
            });

            const previousMessage = queryClient.getQueryData<response>([
                "messages",
                rUser?.id
            ]);

            queryClient.setQueryData(
                ["messages", rUser?.id],
                (old : response) => {
                    if (!old) return old;

                    return {
                        message: old.message.map(m =>
                            m.id === id
                                ? {
                                    ...m,
                                    content: content,
                                }
                                : m
                        )
                    };
                }
            );
            return {previousMessage};
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
            queryClient.invalidateQueries({
                queryKey: ["userlist"]
            });
        }
    })


    const handleDelete = async (id : string) => {
        await deleteMessage.mutateAsync({id: id, rid: rUser?.id ?? ""});
    }

    const handleEdit = async (e: React.SubmitEvent , id : string) => {
        e.preventDefault();
        await editMessage.mutateAsync({id: id, rid: rUser?.id ?? "", content: updatedcontent});
        setIsEditing("");
    }   

    return (
        <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            {
            isEditing !== m.id ?
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <p className={`
                            rounded-2xl px-4 py-2 max-w-[65%] text-foreground text-sm
                            flex justify-center items-center gap-1 whitespace-pre-wrap break-words
                            ${isMine 
                                ? "bg-bubble-sent hover:cursor-pointer" 
                                : "bg-bubble-received border border-border"}
                        `}
                        >
                            {m.content}
                            <span className="text-xs text-muted-foreground mt-5">
                                {new Date(m.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </p>
                    </ContextMenuTrigger>
                    {
                        isMine &&
                        <ContextMenuContent>
                            <ContextMenuItem
                                onClick={() => {
                                    setIsEditing(m.id);
                                    setUpdatedcontent(m.content);
                                }}
                            >
                                Edit
                            </ContextMenuItem>

                            <ContextMenuItem
                                onClick={() => handleDelete(m.id)}
                                className="text-error focus:bg-error/20 focus:text-foreground"
                            >
                                Delete
                            </ContextMenuItem>
                        </ContextMenuContent>
                        }
                </ContextMenu>
                :
                <form onSubmit={(e) => handleEdit(e, m.id)}>
                    <input 
                        ref={editRef}
                        type="text" 
                        value={updatedcontent}
                        onChange={e => setUpdatedcontent(e.currentTarget.value)}
                        className={`
                            rounded-2xl px-4 py-2 max-w-[65%] text-foreground text-sm
                            flex justify-center items-center gap-1
                            text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary
                            ${isMine 
                                ? "bg-surface-secondary border border-border" 
                                : "bg-surface-secondary border border-border"}
                        `}
                        placeholder="Edit Message"
                        >    
                        </input>
                    
                </form>
            }
        </div>
    );
}
