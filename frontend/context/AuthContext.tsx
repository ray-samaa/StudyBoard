"use client"

import Loading from "@/components/loading";
import { logoutRequest, refreshAccessToken, getUserData, getTasks } from "@/functions/api";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useState, SetStateAction, Dispatch, useEffect, useRef } from "react";

type RefreshResult = | {
        status: true
        accessTokenInfo: AccessTokenInfoType
    }
    | {
        status: false
        accessTokenInfo: null
    }

type AccessTokenInfoType = {"access_token": string, "token_type": string, "expires_in": number}
type User = {id: number, username: string, email: string, profile_image_url: string, date: string}
type Tasks = {id: number, title: string, done: boolean}[]


type context = {
    accessToken: string,
    setAccessToken: Dispatch<SetStateAction<string | null>>,
    setAccessFunc: (accessTokenInfo: {"access_token": string, "token_type": string, "token_exp": number}) => void,
    getUserInfo: (accessTokenInfo: AccessTokenInfoType) => Promise<void>,
    logout: () => Promise<void>,
    isLoading: boolean,
    user: User,
    setUser: Dispatch<SetStateAction<User | null>>
    tasks: Tasks,
    setTasks: Dispatch<SetStateAction<string | null>>
}

export let AuthContext = createContext<context | any>({})

export function AuthProvider({ children }: any) {
    let [accessToken, setAccessToken] = useState<string | null>(null)
    let [user, setUser] = useState<User>({id: 0, username: "", email: "", profile_image_url: "", date: ""})
    let [tasks, setTasks] = useState<Tasks>([])
    let [isLoading, setIsLoading] = useState<boolean>(true)
    let refreshTimeOut = useRef<any | null>(null)
    let refreshTime = useRef<number>(0)
    let pathname = usePathname()
    let router = useRouter()

    let setAccessFunc = async (accessTokenInfo: AccessTokenInfoType) => {
        setAccessToken(accessTokenInfo["access_token"])
        refreshTime.current = accessTokenInfo["expires_in"] * 1000
        

        if (refreshTimeOut.current) {
            clearTimeout(refreshTimeOut.current)
        }

        refreshTimeOut.current = setTimeout(async () => {
            let result = await handleRefresh()
        }, refreshTime.current - 60000)

        
    }

    let logout = async () => {
        setAccessToken(null)
        setUser({id: 0, username: "", email: "", profile_image_url: "", date: ""})
        setTasks([])
        refreshTime.current = 0
        if (refreshTimeOut.current) {
            clearTimeout(refreshTimeOut.current)
            refreshTimeOut.current = null
        }

        await logoutRequest()
        router.replace("/")
    }

    let handleRefresh = async (): Promise<RefreshResult> => {
        let data = await refreshAccessToken()
        if (data) {
            await setAccessFunc(data)
            return {"status": true, "accessTokenInfo": data};
        }
        if (pathname !== "/" && pathname !== "/sign-up" && pathname !== "/log-in") {
            await logout()
        }
 
        return {"status": false, "accessTokenInfo": null}
    }

    let getUserInfo = async (accessTokenInfo: AccessTokenInfoType) => {
        let userData = await getUserData(accessTokenInfo["access_token"])
        setUser({...userData})

        let tasksData = await getTasks(accessTokenInfo["access_token"])
        setTasks([...tasksData])
    }


    useEffect(() => {
        async function check() {
            try {
                let result: RefreshResult = await handleRefresh()
                if (result["status"]) {
                    await getUserInfo(result["accessTokenInfo"])
                }
            } finally {
                setIsLoading(false)
            }
        }
        check()

    }, [])

    if (isLoading) {
        return <Loading />
    }

    return (
        <AuthContext.Provider value={{accessToken, setAccessFunc, logout, getUserInfo, isLoading, user, setUser, tasks, setTasks }}>
            { children }
        </AuthContext.Provider>
    )
}
