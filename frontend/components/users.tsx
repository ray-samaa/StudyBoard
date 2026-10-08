"use client"
// import styling files
import "@/styles/components/users.scss";

// import functions (api)
import { getUsers } from "@/functions/api";

// import components
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type UsersType = {"id": number, "username": string, "email": string, "profile_image_url": string | null}[]

export default function UsersComp() {
    let { accessToken } = useAuth()
    let loadMoreRef = useRef<HTMLDivElement | null>(null)
    let [users, setUsers] = useState<UsersType>([])
    let [limit] = useState<number>(20)
    let offsetRef = useRef<number>(0)
    let [loading, setLoading] = useState<boolean>(false)
    let [hasMore, setHasMore] = useState<boolean>(true)

    async function fetchMoreUsers() {
        if (!hasMore || loading) return

        setLoading(true)
        try {
            let fetchUsers = await getUsers(accessToken, limit, offsetRef.current)
            setUsers(prev => [...prev, ...fetchUsers["users"] ])
            offsetRef.current += limit
            setHasMore(fetchUsers["has_more"])

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let observer = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                await fetchMoreUsers()
            }
        })

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        return () => {
            observer.disconnect()
        }

    }, [hasMore])

  return (
    <div className="users-container">
        <div className="container">
            {users.map((user) => (
                <Link key={user["id"]} href={`/users/${user.username}`} className="user">
                    <Image src={user["profile_image_url"] ? user["profile_image_url"] : "/profile.jpg"} alt="user.img" width={100} height={100} loading="eager" />
                    <h3>{user["username"]}</h3>
                    <p>{user["email"]}</p>
                </Link>
            ))}
            <div ref={loadMoreRef}></div>
        </div>
    </div>
  );
}
