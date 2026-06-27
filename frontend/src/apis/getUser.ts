import type{user} from "../type/user"

type res = {
    users: user[]
}

export const getUsers = async() : Promise<res> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
        `http://localhost:3000/user/users`,
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
