'use client'
// import styling files
import "./log-in.scss";

// import hooks
import { useState, useEffect } from "react";

// import components
import Link from "next/link";
import { logIn } from "@/functions/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function LogIn() {
    let {setAccessFunc, getUserInfo} = useAuth()
    let router = useRouter()
    let [username, setUsername] = useState<string>("");
    let [usernameMessage, setUsernameMessage] = useState<string>(""); 

    let [password, setPassword] = useState<string>("");
    let [passwordMessage, setPasswordMessage] = useState<string>("");

    function handleUsername() {
        let usernameCopy = username;

        if (usernameCopy.length < 3) {
            setUsernameMessage("The username length must be 3 atleast")
            return;
        } else (
            setUsernameMessage("")
        )

        if (!usernameCopy.match(/[a-zA-Z]/g)) {
            setUsernameMessage("The username should have 1 letter atleast")
            return;
        } else {
            setUsernameMessage("")
        }

    }


    function handlePassword() {
        let passwordCopy = password;

        if (passwordCopy.length < 6) {
            setPasswordMessage("The password length must be 6 atleast")
            return;
        } else {
            setPasswordMessage("")
        }
    }

    async function handleLogIn() {
        let userData = new URLSearchParams()
        userData.append("username", username)
        userData.append("password", password)

        let result = await logIn(userData)
        if (result === null) {
            setUsername("")
            setPassword("")
            return;
        }

        await setAccessFunc(result)
        await getUserInfo(result)
        router.replace("/dashboard")
    }

    useEffect(() => {
        handleUsername()
    }, [username])


    useEffect(() => {
        handlePassword()
    }, [password])

    


    return (
        <div className="log-in">
            <div>
                <h2>Log in</h2>
                <input type="text" className="main-input" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <p className="message">{ usernameMessage }</p>
                <input type="text" className="main-input" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="message">{ passwordMessage }</p>
                <span className={usernameMessage || passwordMessage ? "submit main-button disable" : "submit main-button"} onClick={handleLogIn}>Log in</span>
                <p className="to-sign-up">Create an account? <Link href="/sign-up">Sign up</Link></p>
            </div>
        </div>
    )
}