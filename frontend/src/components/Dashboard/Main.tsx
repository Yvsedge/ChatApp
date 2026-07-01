import type{user} from "@/type/user"
import ChatHeader from "./Chat/ChatHeader";
import ChatInput from "./Chat/ChatInput";
import ChatList from "./Chat/ChatList";
type Props = {
    rUser: user | undefined;
    onBack?: () => void;
    isMobile: boolean;
};
export default function Main({rUser, onBack, isMobile}: Props) {

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
            <ChatHeader
                rUser={rUser}
                isMobile={isMobile}
                onBack={onBack}
            />
            
            {/* Messages — scrollable, fills space */}
            <ChatList rUser={rUser}></ChatList>

            {/* Input — pinned to bottom */}
            <ChatInput rUser={rUser}></ChatInput>
        </main>
    );
}
