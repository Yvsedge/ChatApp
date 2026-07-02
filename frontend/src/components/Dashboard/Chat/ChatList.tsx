import { fetchMessages} from "@/apis/message";
import {  useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type{user} from "@/type/user"
import type {response } from "@/type/message";
import { errortoast } from "@/components/ToastNotifications/notifications";
import ChatSkeleton from "./ChatSkeleton";
import ChatBubble from "./ChatBubble";

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
