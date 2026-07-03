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

type special = {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    content: string,
    created_at: string,
    unread_count: number,
}

type res = {
    users: special[]
}



export const getUsers = async() : Promise<res> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/users`,
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

export const getCurrent = async() : Promise<currUser> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/current`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if(!response.ok){
        throw new Error("Failed to fetch");
    }

    return response.json();
}
