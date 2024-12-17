import type { UserResponse } from './user'

export type LeaveData = {
    userId: string
    startDate: Date
    endDate: Date
    reason: string
}

export type LeaveResponse = {
    id: string
    reason: string
    startDate: string
    endDate: string
    status: string
    userId: string
    createdAt: Date
    updatedAt: Date
    user?: UserResponse
}
