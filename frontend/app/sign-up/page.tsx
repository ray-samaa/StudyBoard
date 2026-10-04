"use client"
// import styling files
import "./sign-up.scss";

// import hooks
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"


// import components
import Link from "next/link";

// import functions
import { signUp } from "@/functions/api"

export default function SignUp() {
    let { setAccessFunc, getUserInfo } = useAuth()
    let router = useRouter()
    let [username, setUsername] = useState<string>("");
    let [usernameMessage, setUsernameMessage] = useState<string>("");

    let [email, setEmail] = useState<string>("");
    let [emailMessage, setEmailMessage] = useState<string>("");

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

    function handleEmail() {
        let emailCopy = email
        if ( !emailCopy.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ig) ) {
            setEmailMessage("The email is not valid")
            return;
        } else {
            setEmailMessage("")
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

    async function handleSubmit() {
        let inputs = {
            username: username,
            email: email,
            password: password
        }

        let accessTokenInfo = await signUp(inputs)

        if (accessTokenInfo) {
            await setAccessFunc(accessTokenInfo)
            await getUserInfo(accessTokenInfo)
            router.replace("/dashboard")
        }




    }

    useEffect(() => {
        handleUsername()
    }, [username])

    useEffect(() => {
        handleEmail()
    }, [email])

    useEffect(() => {
        handlePassword()
    }, [password])

    


    return (
        <div className="sign-up">
            <div>
                <h2>Sign up</h2>
                <input type="text" className="main-input" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
                <p className="message">{ usernameMessage }</p>
                <input type="email" className="main-input" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                <p className="message">{ emailMessage }</p>
                <input type="text" className="main-input" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <p className="message">{ passwordMessage }</p>
                <span className={usernameMessage || emailMessage || passwordMessage ? "submit main-button disable" : "submit main-button"} onClick={handleSubmit}>Sign up</span>
                <p className="to-log-in">Already have an account? <Link href="/log-in">Log in</Link></p>
            </div>
        </div>
    )
}