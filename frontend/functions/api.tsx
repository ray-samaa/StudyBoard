import { Dispatch, SetStateAction } from "react";


let refreshRequest: Promise<AccessTokenInfoType | null> | null = null;
let profileRequest: Promise<User> | null = null
let usersRequest: Promise<OtherUsersType> | null = null;
let tasksRequest: Promise<Tasks> | null = null

type User = {id: number, username: string, email: string, "profile_image_url": string, date: string}
type SetUserType = Dispatch<SetStateAction<User>>;
type OtherUserType = {"id": number, "username": string, "email": string, "profile_image_url": string}
type OtherUsersType = {users: OtherUserType[], "has_more": boolean }

type AccessTokenInfoType = { "access_token": string, "token_type": string, "expires_in": number}

type Tasks = {id: number, title: string, done: boolean}[]
type SetTasksType = Dispatch<SetStateAction<Tasks>>;




// Auth
export async function signUp(inputs: {username: string, email: string, password: string}) {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(inputs)
        })
        
        let data = await response.json()

        if (!response.ok) {
            throw new Error(`${data["detail"]}`)
        }


        return data

    } catch (reason) {
        throw new Error(`error: ${reason}`)
    }

}

export async function logIn(userData: URLSearchParams) {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            body: userData
        })
        
        if (response.status === 401) return null;

        let data = await response.json()
        return data

    } catch (reason) {
        throw new Error(`error: ${reason}`)
    }
}

export async function logoutRequest() {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        )

        let data = await response.json()
        return data
    } catch (reason) {
        throw new Error(`reason: ${reason}`)
    }
}

export async function refreshAccessToken() {
    if (refreshRequest) return refreshRequest

    refreshRequest = (async () => {
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include"
            })

            if (!response.ok) return null;

            let data = await response.json()
            return data

        } catch (reason) {
            throw new Error(`${reason}`)

        } finally {
            refreshRequest = null
        }
    })()

    return refreshRequest  
}

// Users
export async function getUserData(accessToken: string) {
    if (profileRequest) {
        return profileRequest
    }
    profileRequest = (async () => {
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `bearer ${accessToken}`
                }
            })
            
            let data = await response.json()

            if (!response.ok) {
                throw new Error(data["detail"])
            }

            return data
        
        } catch (reason) {
            throw new Error(`${reason}`)

        } finally {
            profileRequest = null
        }

        

    })()
        
    return profileRequest
    
}

export async function uploadProfileImage(accessToken: string, file: File) {
    let formData = new FormData()
    formData.append("image", file)

    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile-image`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Authorization": `bearer ${accessToken}`
            },
            body: formData
        })

        if (!response.ok) {
            throw new Error("Error occured in uploading the profile image")
        }

        let data = await response.json()

        return data["profile_image_url"]

    } catch (reason) {
        throw new Error(`${reason}`)
    }
}

export async function getUsers(accessToken: string, limit: number, offset: number): Promise<OtherUsersType> {
    if (usersRequest) {
        return usersRequest;
    }

    usersRequest = (async () => {
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?limit=${limit}&offset=${offset}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `bearer ${accessToken}`
                }
            })
            
            let data = await response.json()
    
            if (!response.ok) {
                throw new Error(data["detail"])
            }
    
            return data
    
        }  catch (reason) {
            throw new Error(`${reason}`)
        } finally {
            usersRequest = null
        }
    })()

    return usersRequest

    
}

export async function getUser(username: string): Promise<OtherUserType | null> {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}`, {
            method: "GET",
            credentials: "include",
        })
        
        
        if (!response.ok) {
            return null
        }
        
        let data = await response.json()
        return data

    }  catch {
        return null
    }
}


// Tasks
export async function getTasks(accessToken: string): Promise<Tasks> {
    if (tasksRequest) {
        return tasksRequest;
    }
    tasksRequest = (async () => {
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Authorization": `bearer ${accessToken}`
                }
            })
    
            
            if (!response.ok) {
                throw new Error(`${await response.text()}`)
            }
            
            let data = await response.json()
    
            return data
    
    
    
        } catch (reason) {
            throw new Error(`${reason}`)
        } finally {
            tasksRequest = null
        }

    })()

    return tasksRequest
}

export async function createTaskRequest(accessToken: string, taskTitle: string) {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "Authorization": `bearer ${accessToken}`
            },
            body: JSON.stringify({"title": taskTitle})

        })

        
        if (!response.ok) {
            throw new Error(await response.text())
        }

        let data = await response.json()

        return data
        

    } catch (reason) {
        throw new Error(`${reason}`)
    }
}

export async function DeleteTasksRequest(accessToken: string, tasksId: number[]) {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "Authorization": `bearer ${accessToken}`
            },
            body: JSON.stringify({"ids": tasksId})

        })

        
        if (!response.ok) {
            throw new Error(await response.text())
        }
        
        let data = await response.json()

        return data


    } catch (reason) {
        throw new Error(`${reason}`)
    }
}

export async function UpdateTask(accessToken: string, taskInfo: {"task_id": number, "done": boolean}) {
    try {
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "Authorization": `bearer ${accessToken}`
            },
            body: JSON.stringify(taskInfo)
        })

        
        if (!response.ok) {
            throw new Error(await response.text())
        }

        let data = await response.json()
        
        return data


    } catch (reason) {
        throw new Error(`${reason}`)
    }
}
