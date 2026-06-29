import { PresenseContext } from "@/context/presenseContext";
import { useContext } from "react";


export function usePresense() {
    return useContext(PresenseContext);
}
