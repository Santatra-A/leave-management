export interface User {
    id: string
    name: string
    email: string
    remainingLeaveDays: number
    totalLeaveDays?: number
    role?: string
    isVerified?: boolean
}

export interface UserResponse {
    id: string
    name: string
    email: string
    password: string
    remainingLeaveDays: number
    role: string
    totalLeaveDays: number
    tokenVersion: number
    createdAt: Date
    updatedAt: Date
}
