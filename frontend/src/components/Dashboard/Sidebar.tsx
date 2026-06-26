import { useQuery } from "@tanstack/react-query";

type Props = {
    sendID : (rid : string) => void;
};

type user = {
    id : string,
    firstname: string,
    lastname: string,
    email: string,
};

type res = {
    users: user[]
}


const getUsers = async() : Promise<res> => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    const response = await fetch(
        `http://localhost:3000/user/${id}`,
        {
            headers: {
                Authorization : `Bearer ${token}`
            }
        }
    );

    if(!response.ok){
        throw new Error("Failed to fetch");
    }

    return response.json();
}

export default function Sidebar({ sendID }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["userlist"],
        queryFn: getUsers
    });

    const userList = data?.users ?? [];

    return (
        <aside className="h-full w-80 flex flex-col border-r border-border bg-card shrink-0">
            <div className="px-4 py-4 border-b border-border">
                <h2 className="text-foreground font-semibold text-sm">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <p className="text-muted-foreground text-sm px-4 py-3">Loading...</p>
                )}
                {error && (
                    <p className="text-error text-sm px-4 py-3">Failed to load users</p>
                )}
                {userList.map(u => (
                    <button
                        key={u.id}
                        onClick={() => sendID(u.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors text-left border-b border-border cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-xs font-semibold">
                                {(u.firstname[0] + (u.lastname[0] ?? "")).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-foreground text-sm font-medium truncate">
                                {u.firstname} {u.lastname}
                            </span>
                            <span className="text-muted-foreground text-xs truncate">
                                {u.email}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
}
