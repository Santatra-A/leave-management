'use client'
import { api } from '@/lib/api'
import type { LeaveResponse } from '@/types/leave'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGetLeaves } from './get-leaves'

const updateStatus = async (id: string, status: string) => {
    const response = await api.put<LeaveResponse>(`/leaves/${id}`, { status })

    if (!response.data) {
        throw new Error('Failed to send message')
    }
}

export const useUpdateLeaveStatus = (status: string) => {
    const { refetch } = useGetLeaves()
    const updateMutation = useMutation({
        mutationFn: (leaves: LeaveResponse) => updateStatus(leaves.id, status),
        onSuccess: () => {
            refetch()
            toast.success(`Congé ${status === 'APPROVED' ? 'approuvé' : 'rejété'} avec succès !`)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const onSubmit = (data: LeaveResponse) => {
        updateMutation.mutate({
            id: data.id,
            reason: data.reason,
            startDate: data.startDate,
            endDate: data.endDate,
            status: status,
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        })
    }

    return { updateMutation, onSubmit }
}
