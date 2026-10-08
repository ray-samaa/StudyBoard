"use client"
import { useAuth } from "@/hooks/useAuth";
// import styling files
import "@/styles/components/header.scss";

// import hooks

// import components
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header({ pageName }: { pageName: string }) {
    let {user} = useAuth()
    
    return (
        <div className="header">
            <div className="container">
                <div className="links">
                    <Link href="/dashboard" className={pageName === "dashboard" ? "disable" : ""}>Dashboard</Link>
                    <Link href="/profile" className={pageName === "profile" ? "disable" : ""}>Profile</Link>
                    <Link href="/users" className={pageName === "users" ? "disable" : ""}>users</Link>
                </div>
                <div className="profile-img-container">
                    <Link href="/profile" className={pageName === "profile" ? "disable" : ""}>
                        <Image src={user["profile_image_url"] ? user["profile_image_url"] : "/profile.jpg"} alt="profile.img" width={70} height={70} loading="eager" /> 
                    </Link>
                </div>
            </div>
        </div>
    )
}