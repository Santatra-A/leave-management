import { api } from '@/lib/api'
import type { User } from '@/types/user'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGetUsers } from './get-users'

export const updateUser = async (
    id: string,
    payload: {
        totalLeaveDays?: number
        remainingLeaveDays?: number
        role?: string
    }
): Promise<User> => {
    const response = await api.put<User>(`/auth/users/${id}`, payload)
    return response.data
}

export const useUpdateUser = (totalLeaveDays: number, remainingLeaveDays: number, role: string) => {
    const { refetch } = useGetUsers()
    const updateMutation = useMutation({
        mutationFn: (user: User) => updateUser(user.id, { totalLeaveDays: totalLeaveDays, remainingLeaveDays: remainingLeaveDays, role: role }),
        onSuccess: () => {
            toast.success('Nombre de jours de congés modifié!')
            refetch()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const onSubmit = (data: User) => {
        updateMutation.mutate({
            id: data.id,
            name: data.name,
            email: data.email,
            remainingLeaveDays: remainingLeaveDays,
            totalLeaveDays: totalLeaveDays,
            role: data.role,
            isVerified: data.isVerified
        })
    }

    return { updateMutation, onSubmit }
}
