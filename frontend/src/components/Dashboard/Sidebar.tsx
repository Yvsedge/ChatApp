import { useQuery } from "@tanstack/react-query";

type Props = {
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

export default function Sidebar({}: Props) {
    const {data, isLoading, error} = useQuery({
        queryKey: ["userlist"],
        queryFn: getUsers
    });

    const userList = data?.users ?? [];
    return (
        <>
            <aside className="p-5">
                {
                    userList.map(u => 
                        <p>
                            {u.firstname}
                            <br />
                            {u.email}
                        </p>
                    )
                }
            </aside>
        </>
    );
}
