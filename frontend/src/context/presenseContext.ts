import { createContext } from "react";


type presenseType = {
    onlineUsers : string[],
    typingUsers: Set<string>, 
}

export const PresenseContext = createContext<presenseType>({
    onlineUsers: [],
    typingUsers: new Set, 
});
