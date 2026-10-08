// import styling files
import "./user.scss";

// import hooks

// import components
import Header from "@/components/header";
import { getUser } from "@/functions/api";
import Image from "next/image";
import { notFound } from "next/navigation";

// import functions


async function handleUser(username: string) {
    let userInfo = await getUser(username)
    if (!userInfo) {
        notFound()
    }

    return userInfo
}

export default async function User({ params }: {params: Promise<{user: string}>}) {
  let {user: username} = await params
  let user = await handleUser(username)


  return (
    <div className="user">
      <Header pageName="user" />
      <div className="user-container">
        <div className="container">
            <div className="box">
                <Image src={user["profile_image_url"] ? user["profile_image_url"] : "/profile.jfif"} className="user-img" alt="user.img" width={200} height={200} loading="eager"></Image>
                <p className="username">{user["username"]}</p>
                <p className="email">{user["email"]}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
