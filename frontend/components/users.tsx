"use client"
// import styling files
import "@/styles/components/users.scss";

// import functions (api)
import { getUsers } from "@/functions/api";

// import components
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type UsersType = {"id": number, "username": string, "email": string, "profile_image_url": string | null}[]

export default function UsersComp() {
    let { accessToken } = useAuth()
    let [users, setUsers] = useState<UsersType>([])

    useEffect(() => {
        (async () => {
            let fetchUsers = await getUsers(accessToken)
            setUsers([...fetchUsers])
        })()

    }, [])

  return (
    <div className="users-container">
        <div className="container">
            {users.map((user) => (
                <Link key={user["id"]} href={`/users/${user.username}`} className="user">
                    <Image src={user["profile_image_url"] ? `${process.env.NEXT_PUBLIC_API_URL}${user["profile_image_url"]}` : "/profile.jfif"} alt="user.img" width={100} height={100} loading="eager" />
                    <h3>{user["username"]}</h3>
                    <p>{user["email"]}</p>
                </Link>
            ))}
        </div>
    </div>
  );
}
