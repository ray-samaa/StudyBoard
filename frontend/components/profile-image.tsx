'use client'
// import styling files
import "@/styles/components/profile-image.scss"

// import hooks
import { useAuth } from "@/hooks/useAuth";

// import components
import Image from "next/image";
import { Camera } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { uploadProfileImage } from "@/functions/api";

// import functions

export default function ProfileImage() {
    let {user, setUser, accessToken} = useAuth()
    let [image, setImage] = useState<string>(user["profile_image_url"] || "/profile.jfif")
    let inputRef = useRef<HTMLInputElement>(null)

    function handleClickingImage() {
        inputRef.current?.click()
    }

    async function handleChooseImage(event: ChangeEvent<HTMLInputElement>) {
        let file = event.target.files?.[0]

        if (file) {
            let data = await uploadProfileImage(accessToken, file)
            setUser({...user, "profile_image_url": data})
            setImage(data || "/profile.jfif")
        };

    }


    return (
        <div className="profile-image-container">
            <Image src={image} className="porfile-img" alt="profile.img" width={200} height={200} loading="eager"></Image>

            <button className="change-image" onClick={handleClickingImage}><Camera size={30} /></button>

            <input type="file" ref={inputRef} accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => handleChooseImage(e)} hidden />
        </div>
    );
}
