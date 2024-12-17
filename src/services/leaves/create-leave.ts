'use client'
import { api } from '@/lib/api'
import type { LeaveData, LeaveResponse } from '@/types/leave'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGetLeaves } from './get-leaves'

const createLeave = async (data: LeaveData): Promise<LeaveResponse> => {
    const response = await api.post<LeaveResponse>('/leaves', data)

    if (!response.data) {
        throw new Error('Failed to send message')
    }

    return response.data
}

export const useCreateLeave = () => {
    const { refetch } = useGetLeaves()
    const createMutation = useMutation({
        mutationFn: (leaves: LeaveData) => createLeave(leaves),
        onSuccess: () => {
            refetch()
            toast.success('Congé ajouté avec succès !', { duration: 3000 })
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || 'Unknown error occurred'
            toast.error(errorMessage, { duration: 10000 })
        }
    })

    const onSubmit = (userId: string, startDate: Date, endDate: Date, reason: string) => {
        createMutation.mutate({
            userId: userId,
            startDate: startDate,
            endDate: endDate,
            reason: reason
        })
    }

    return { createMutation, onSubmit }
}
