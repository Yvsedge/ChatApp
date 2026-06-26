import { toast } from "react-hot-toast";

export const errortoast = (msg : string) => {
    toast.error(`${msg}`,{
        style: {
            background: "var(--error)",
            color: "var(--foreground)",
            border: "1px solid var(--border)"
        }
    })
}

export const successtoast = (msg : string) => {
    toast.success(`${msg}`,{
        style: {
            background: "var(--success)",
            color: "var(--primary-foreground)",
            border: "1px solid var(--border)"
        }
    })
}
