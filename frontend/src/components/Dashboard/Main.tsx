import { useQuery } from "@tanstack/react-query";

type Props = {
};

type response = {
    message : {id : string,
    sender_id: string,
    receiver_id: string,
    content: string,
    created_at: string,
    }[],
}

const fetchMessages = async() : Promise<response> => {
    const token = localStorage.getItem('token');
    const res = await fetch(
        `http://localhost:3000/message/a47ed654-b2ca-4115-ac49-735b6900ee3a`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if(!res.ok){
        throw new Error("Failed to fetch");
    }

    return res.json();
}

export default function Main({}: Props) {
    const {data, isLoading, error} = useQuery<response>({
        queryKey: ['messages'],
        queryFn: fetchMessages,
    });

    if(isLoading) return(<h1>Loading...</h1>)
    if(error) return(<h1>Error</h1>)  

    const msgs = data?.message ?? [];
    return (
        <>
            <main>
                {
                    msgs.map(m => 
                        <p key={m.id}>
                            Content:  {m.content}
                            <br />
                            Sender_id{m.sender_id}
                        </p>
                    )
                }
            </main>
        </>
    );
}
