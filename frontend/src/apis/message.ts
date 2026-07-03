type Message = {
    id : string,
    sender_id: string,
    receiver_id: string,
    content: string,
    created_at: string,
    is_unread: boolean,
}

type response = {
    message : Message[],
}


export const fetchMessages = async(rId : string) : Promise<response> => {
    const token = localStorage.getItem('token');
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/message/${rId}`,{
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
