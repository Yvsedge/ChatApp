import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { data, useNavigate } from "react-router-dom";

type Props = {
};

type User = {
    mail : string,
    password : string
}

export default function Login({}: Props) {
    const [mail, setMail] = useState("");
    const [pass, setPass] = useState("");
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

            

            if (!response.ok) {
                    throw new Error();
            }

            return response.json();
        },

        onSuccess: (data) => {
            localStorage.setItem(
                "token",
                data.token
            );
            console.log(data.id);
            localStorage.setItem(
                "id",
                data.id
            )
        },
    })
    const navigate = useNavigate();
    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const obj : User = {
            mail : mail,
            password : pass
        };

        await loginUser.mutateAsync(obj);

        setMail("");
        setPass("");

        navigate("/")
    };
    return (
        <>
            <form onSubmit={e => handleSubmit(e)}>
                <input type="email" name="email" id="email" value={mail} onChange={e => setMail(e.currentTarget.value)} className="bg-neutral-300 border-2   border-b-black"/>
                <input type="password" name="password" id="password" value={pass} onChange={e => setPass(e.currentTarget.value)}  className="bg-neutral-300 border-2   border-b-black"/>
                <button type="submit">Submit</button>
            </form>
        </>
    );
}
