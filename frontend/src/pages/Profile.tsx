import { getCurrent } from "@/apis/getUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { errortoast } from "../components/ToastNotifications/notifications";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/../@/components/ui/dialog"
import { Button } from "../../@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/../@/components/ui/alert-dialog"
import { socket } from "@/socket/socket";
import { useNavigate } from "react-router-dom";

type insert = {
    firstname : string,
    lastname : string
}

export type user = {
    id : string,
    firstname: string,
    lastname: string,
    email: string,
    created_at: string,
};

type currUser = {
    user: user
}


export default function Profile() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["curruser"],
        queryFn: getCurrent
    });

    useEffect(() => {
        if (error) {
            errortoast("Error");
        }
    }, [error])

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const editMutation = useMutation({
        mutationFn: async(obj : insert) : Promise<currUser> => {
                const token = localStorage.getItem('token');
                const res = await fetch(
                    `http://localhost:3000/user/edit`,{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(obj)
                    }
                )
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message);
                }

                return result;

            },
            onMutate: async (obj) => {
            await queryClient.cancelQueries({
                queryKey: ["curruser"]
            });

            const previousUser = queryClient.getQueryData<currUser>([
                "curruser"
            ]);

            queryClient.setQueryData(
                ["curruser"],
                (old?: currUser) => {
                    if (!old) return old;

                    return {
                        user: {
                            ...old.user,
                            firstname: obj.firstname,
                            lastname: obj.lastname,
                        },
                    };
                }
            );

            return {previousUser};
            },
            onSuccess: (data) => {
                queryClient.setQueryData(["curruser"], data);
                setOpen(false);
            },

            onError: (_,__,context) => {
                queryClient.setQueryData(
                    ["curruser"],
                    context?.previousUser
                );
            },

            onSettled() {
                queryClient.invalidateQueries({
                    queryKey: ["curruser"]
                });
            }
    })

    const deleteMutation = useMutation({
        mutationFn: async() => {
                const token = localStorage.getItem('token');
                const res = await fetch(
                    `http://localhost:3000/user/delete`,{
                    method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message);
                }

                return result;

            },

            onSuccess: () => {
                socket.disconnect();

                localStorage.removeItem("token");
                localStorage.removeItem("id");

                queryClient.clear();

                navigate("/Login");
            },
    })

    const [firstname, setFirstname] = useState(data?.user?.firstname ?? "");
    const [lastname, setLastname] = useState(data?.user?.lastname ?? "");
    const [open, setOpen] = useState(false);

    if (isLoading)
        {
            return(
                <div className="bg-background flex justify-center items-center h-screen w-screen ">
                    <div className="bg-card border border-border rounded-2xl flex flex-col items-center gap-6 w-full max-w-sm px-8 py-10">

                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                            <span className="text-primary-foreground text-2xl font-semibold">
                            </span>
                        </div>

                        <div className="text-center">
                            <h1 className="text-foreground text-xl font-semibold animate-pulse px-6 py-2 bg-muted-foreground rounded-md">
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 animate-pulse"></p>
                        </div>

                        <div className="w-full border border-border rounded-xl overflow-hidden">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                                <span className="text-muted-foreground text-sm">First name</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                                <span className="text-muted-foreground text-sm">Last name</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-muted-foreground text-sm">Member since</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                        </div>

                        <div className="w-full flex gap-3">
                            <button 
                                disabled={isLoading}
                                className="flex-1 py-2 rounded-xl border border-border text-foreground text-sm hover:bg-surface-secondary transition-colors cursor-pointer disabled:bg-accent disabled:cursor-not-allowed">
                                Edit profile
                            </button>
                            <button 
                                disabled={isLoading}
                                className="flex-1 py-2 rounded-xl text-error text-sm bg-error/10 hover:bg-error/20 transition-colors cursor-pointer disabled:bg-accent disabled:cursor-not-allowed">
                                Delete profile
                            </button>
                        </div>

                    </div>
                </div>  
            );
    };

    const u = data?.user;
    const initials = ((u?.firstname[0] ?? "") + (u?.lastname[0] ?? "")).toUpperCase();
    const memberSince = new Date(u?.created_at ?? "").toLocaleDateString([], {
        year: "numeric",
        month: "long",
    });

    if(u == undefined){
            return(
                <div className="bg-background flex justify-center items-center h-screen w-screen ">
                    <div className="bg-card border border-border rounded-2xl flex flex-col items-center gap-6 w-full max-w-sm px-8 py-10">

                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                            <span className="text-primary-foreground text-2xl font-semibold">
                            </span>
                        </div>

                        <div className="text-center">
                            <h1 className="text-foreground text-xl font-semibold animate-pulse px-6 py-2 bg-muted-foreground rounded-md">
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 animate-pulse"></p>
                        </div>

                        <div className="w-full border border-border rounded-xl overflow-hidden">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                                <span className="text-muted-foreground text-sm">First name</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                                <span className="text-muted-foreground text-sm">Last name</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-3">
                                <span className="text-muted-foreground text-sm">Member since</span>
                                <span className="text-foreground text-sm font-medium animate-pulse px-6 py-2 bg-muted-foreground rounded-md"></span>
                            </div>
                        </div>

                        <div className="w-full flex gap-3">
                            <button 
                                disabled={isLoading}
                                className="flex-1 py-2 rounded-xl border border-border text-foreground text-sm hover:bg-surface-secondary transition-colors cursor-pointer disabled:bg-accent disabled:cursor-not-allowed">
                                Edit profile
                            </button>
                            <button 
                                disabled={isLoading}
                                className="flex-1 py-2 rounded-xl text-error text-sm bg-error/10 hover:bg-error/20 transition-colors cursor-pointer disabled:bg-accent disabled:cursor-not-allowed">
                                Delete profile
                            </button>
                        </div>

                    </div>
                </div>  
            );
    };

    const onEdit = async () => {
    
        if (!firstname.trim() || !lastname.trim()) {
            errortoast("Name cannot be empty");
            return;
        }
        const obj : insert = {
            firstname: firstname,
            lastname: lastname
        };

        await editMutation.mutateAsync(obj);
    }

    const handleDelete = async () => {
        await deleteMutation.mutateAsync();
    }

    return (
        <div className="bg-background flex justify-center items-center h-screen w-screen">
            <div className="bg-card border border-border rounded-2xl flex flex-col items-center gap-6 w-full max-w-sm px-8 py-10">

                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-2xl font-semibold">
                        {initials}
                    </span>
                </div>

                {/* Name + email */}
                <div className="text-center">
                    <h1 className="text-foreground text-xl font-semibold">
                        {u?.firstname} {u?.lastname}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">{u?.email}</p>
                </div>

                {/* Info row */}
                <div className="w-full border border-border rounded-xl overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                        <span className="text-muted-foreground text-sm">First name</span>
                        <span className="text-foreground text-sm font-medium">{u?.firstname}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-border">
                        <span className="text-muted-foreground text-sm">Last name</span>
                        <span className="text-foreground text-sm font-medium">{u?.lastname}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-muted-foreground text-sm">Member since</span>
                        <span className="text-foreground text-sm font-medium">{memberSince}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full flex gap-3">
                    <Dialog
                            open={open}
                            onOpenChange={(value) => {
                                setOpen(value);

                                if (value) {
                                    setFirstname(u.firstname);
                                    setLastname(u.lastname);
                                }
                            }}
                    >
                    <DialogTrigger asChild>
                        <button 
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl border-2 border-border text-foreground text-sm hover:bg-primary/20 hover:border-primary transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                            Edit profile
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Update your first and last name.
                        </DialogDescription>
                    </DialogHeader>

                        {/* form fields go here */}
                        <div className="flex flex-col gap-3 py-2">
                            <input 
                                placeholder="First name" 
                                className="bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary" 
                                value={firstname}
                                onChange={(e) => setFirstname(e.currentTarget.value)}
                            />
                            <input 
                                placeholder="Last name" 
                                className="bg-surface-secondary border border-border rounded-xl px-4 py-2 text-foreground text-sm outline-none focus:ring-1 focus:ring-primary" 
                                value={lastname}
                                onChange={(e) => setLastname(e.currentTarget.value)}
                            />
                        </div>

                        <DialogFooter showCloseButton>
                            <Button 
                                variant="default" 
                                onClick={onEdit}
                            >Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>

                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button 
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl text-error text-sm bg-error/10 hover:bg-error/20 transition-colors cursor-pointer disabled:bg-accent disabled:cursor-not-allowed">
                            Delete profile
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="text-error text-sm bg-error/10 hover:bg-error/20 transition-colors cursor-pointer">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
