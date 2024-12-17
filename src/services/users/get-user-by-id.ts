import { api } from '@/lib/api'
import type { User } from '@/types/user'
import { useQuery } from '@tanstack/react-query'

export const getUserById = async (id: string): Promise<User> => {
    const response = await api.get<User>(`/auth/users/${id}`)
    return response.data
}

export const useGetUserByID = (id?: string) => {
    const {
        data: user,
        isPending,
        error,
        refetch
    } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserById(id!),
        enabled: !!id
    })
    return { user, isPending, error, refetch }
}
