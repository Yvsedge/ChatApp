import { errortoast, successtoast } from "@/components/ToastNotifications/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {Link, useNavigate } from "react-router-dom";

type User = {
    mail : string,
    password : string
}

export default function Login() {
    const [mail, setMail] = useState("");
    const [pass, setPass] = useState("");
    const navigate = useNavigate();

    const loginUser = useMutation({
        mutationFn: async (user : User) => {
            const response = await fetch(
                `http://localhost:3000/user/login`,
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

        onSuccess: (data) => {
            successtoast("Login Successful !");
            setMail("");
            setPass("");
            localStorage.setItem(
                "token",
                data.token
            );
            localStorage.setItem(
                "id",
                data.id
            )
            navigate("/");
        },

        onError: (error: Error) => {
            errortoast(error.message);
        },
    })
    
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!mail.trim() || !pass.trim()){
            errortoast("Invalid Input");
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

        const obj : User = {
            mail : mail,
            password : pass
        };

        await loginUser.mutateAsync(obj);
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
                    Welcome back
                    <span 
                        className="text-sm text-muted-foreground"
                    >If you don't have a account, <Link to={"/Register"} className="text-primary">Register</Link></span>
                </p>
                <form 
                    onSubmit={e => handleSubmit(e)}
                    className="flex flex-col gap-2"
                >
                    <label 
                        htmlFor="email"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Email
                        <input 
                            type="email" 
                            name="email" 
                            id="email"
                            value={mail} 
                            onChange={e => setMail(e.currentTarget.value)} 
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                            placeholder="johndoe@gmail.com"
                        />
                    </label>
                    <label 
                        htmlFor="password"
                        className="flex flex-col text-sm font-medium text-foreground"
                    >Password
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            value={pass} 
                            onChange={e => setPass(e.currentTarget.value)}  
                            className="flex-1 bg-surface-secondary border border-border px-4 py-2 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                            placeholder="John123@"
                        />
                    </label>
                    <button 
                        type="submit"
                        className="bg-primary text-primary-foreground px-5 py-3 border border-border text-md font-medium disabled:opacity-40 transition-opacity"
                        disabled={loginUser.isPending}
                    >
                        {loginUser.isPending ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
