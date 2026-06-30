import { fetchMessages} from "@/apis/message";
import {  useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type{user} from "@/type/user"
import type { Message, response } from "@/type/message";
import { errortoast } from "@/components/ToastNotifications/notifications";
import { socket } from "@/socket/socket";
import ChatSkeleton from "./ChatSkeleton";
import ChatBubble from "./ChatBubble";

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

type Props = {
    rUser: user
};

export default function ChatList({rUser}: Props) {

    const {data, isLoading, error} = useQuery<response>({
        queryKey: ["messages", rUser?.id],
        queryFn: () => fetchMessages(rUser.id ?? ""),
        enabled: !!rUser.id,
    });

    const msgs = data?.message ?? [];
    const filtermsgs = msgs.filter(m => m.content !== "");

    const bottomRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
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

        socket.on("message_deleted", ({ id, senderId, receiverId }) => {
            const currentUser = rUser?.id;

            if (
                senderId !== currentUser &&
                receiverId !== currentUser
            ) {
                return;
            }
            queryClient.setQueryData<response>(
                ["messages", rUser?.id],
                old => {
                    if (!old) return old;

                    return {
                        message: old.message.filter(m => m.id !== id),
                    };
                }
            );
        });

            socket.on("message_updated", ({message, senderId, receiverId}) => {
                const currId = localStorage.getItem("id");

                const otherUser =
                    senderId === currId
                        ? receiverId
                        : senderId;

                if (otherUser !== rUser?.id) return;

                queryClient.setQueryData(
                    ["messages", otherUser],
                    (old : response) => {
                        if (!old) return old;

                        return {
                            message: old.message.map(m =>
                                m.id === message.id
                                    ? message
                                    : m
                            )
                        };
                    }
                );
        });

        return () => {
            socket.off("receiver_message", handleReceive);
            socket.off("message_deleted");
            socket.off("message_updated");
        }
    }, [queryClient, rUser]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [msgs]);

    useEffect(() => {
        if (error) {
            errortoast("Error");
        }
    }, [error]);

    if(isLoading){
        return(<ChatSkeleton></ChatSkeleton>);
    }

    return (
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4 min-h-0">
                <div className="flex-grow" />
                {msgs.length === 0 
                    ? <p className="text-muted-foreground text-sm text-center mt-4">No messages yet</p>
                    : filtermsgs.map(m => 
                        <ChatBubble key={m.id} m={m} rUser={rUser}></ChatBubble>
                    )
                }
                <div ref={bottomRef}/>
            </div >
    );
}
