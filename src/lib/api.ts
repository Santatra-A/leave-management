import axios from 'axios'
import { getSession } from 'next-auth/react'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
})

api.interceptors.request.use(
    async (config) => {
        const session = (await getSession()) as any
        if (session?.user?.email) {
            // Adjust based on how you store the token
            config.headers.Authorization = `Bearer ${session.user.token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
)
