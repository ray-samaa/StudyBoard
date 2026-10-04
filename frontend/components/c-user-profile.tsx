'use client'
// import styling files

// import hooks
import { useAuth } from "@/hooks/useAuth";

// import components
import Image from "next/image";
import ProfileImage from "./profile-image";

// import functions

export default function CUserProfile() {
    let {user, logout} = useAuth()
  


    async function handleLogout() {
        await logout()
    }

    return (
        <div className="profile-container">
            <div className="container">
                <div className="box">
                    <ProfileImage />
                    <p className="username">{user["username"]}</p>
                    <p className="email">{user["email"]}</p>
                    <span className="log-out main-button" onClick={handleLogout}>Log out</span>
                </div>
            </div>
        </div>
    );
}
