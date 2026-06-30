import { usePresense } from "@/hook/usePresense";
import type{user} from "@/type/user"
type Props = {
    rUser : user | undefined,
};


export default function ChatHeader({rUser}: Props) {
    const {typingUsers} = usePresense();
    if (!rUser) return null;
    return (
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
                        <span className="text-muted-foreground text-xs truncate ">{typingUsers.has(rUser.id) && "is Typing"}</span>
                    </p>
                </div>
            </div>
    );
}
