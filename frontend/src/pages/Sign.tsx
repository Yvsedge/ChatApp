import { errortoast, successtoast } from "@/components/ToastNotifications/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {Link, useNavigate } from "react-router-dom";

type User = {
    id: string,
    firstname: string,
    lastname: string,
    mail : string,
    password : string
}


export default function Sign() {
    const [first, SetFirst] = useState("");
    const [last, setLast] = useState("");
    const [mail, setMail] = useState("");
    const [pass, setPass] = useState("");
    const [confirm, setConfirm] = useState("");
    const navigate = useNavigate();
    const signUp = useMutation({
        mutationFn: async (user : User) => {
            const response = await fetch(
                `http://localhost:3000/user/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(user)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            return result;
        },
        onSuccess: () => {
            successtoast("Registerd!")
            SetFirst("");
            setLast("");
            setMail("");
            setPass("");
            setConfirm("");
            navigate("/Login")
        },

        onError: (error: Error) => {
            errortoast(error.message);
        },
    })
    
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!first.trim() || !mail.trim() || !pass.trim() || !confirm.trim()){
            errortoast("Empty Field")
            return;
        }

        if (pass.length < 8) {
            errortoast("Password must be at least 8 characters");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(mail)) {
            errortoast("Invalid email");
            return;
        }

        if (pass !== confirm) {
            errortoast("Password not matching");
            return;
        }

        const obj : User = {
            id : crypto.randomUUID(),
            firstname: first,
            lastname: last,
            mail : mail,
            password : pass
        };

        await signUp.mutateAsync(obj);


    };
    return (
        <div
            className="h-screen w-full flex justify-center items-center "
        >
            <div
                className="bg-card py-10 px-15 border border-border flex justify-center items-center flex-col gap-5 rounded-2xl"
            >
                <p
                    className="text-2xl flex flex-col justify-center items-center"
                >
                    Welcome
                    <span 
                        className="text-sm text-muted-foreground"
                    >Already have an Account, <Link to={"/Login"} className="text-primary">Login</Link></span>
                </p>
                <form 
                    onSubmit={e => handleSubmit(e)}
                    className="flex flex-col gap-2"
                >
                <div
                    className="md:flex gap-2"
                >
                    <label 
                        htmlFor="first"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >First Name
                        <input 
                            type="text"
                            name="first"
                            value={first}
                            placeholder="John"
                            onChange={e => SetFirst(e.currentTarget.value)}
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                    </label>
                    <label 
                        htmlFor="last"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Last Name
                    <input 
                        type="text"
                        name="last"
                        value={last}
                        placeholder="Doe"
                        onChange={e => setLast(e.currentTarget.value)}
                        className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    </label>
                </div>
                    <label 
                        htmlFor="email"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Email
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={mail} 
                            placeholder="johndoe@email.com"
                            onChange={e => setMail(e.currentTarget.value)} 
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                    </label>
                    <label 
                        htmlFor="first"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Password
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            placeholder="Enter Password"
                            value={pass} 
                            onChange={e => setPass(e.currentTarget.value)}  
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                    </label>
                    <label 
                        htmlFor="confirm"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Repeat Password
                        <input 
                            type="password" 
                            name="confirm" 
                            id="confirm" 
                            value={confirm} 
                            placeholder="Repeat Password"
                            onChange={e => setConfirm(e.currentTarget.value)}  
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                        />
                    </label>
                    <button 
                        type="submit"
                        className="bg-primary text-primary-foreground px-5 py-3 border border-border text-md font-medium disabled:opacity-40 transition-opacity hover:cursor-pointer"
                        disabled={signUp.isPending}
                    >Register</button>
                </form>
            </div>
        </div>
    );
}
