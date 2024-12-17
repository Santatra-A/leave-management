import axios from 'axios'

export const reportAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_REPORTING_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
})
