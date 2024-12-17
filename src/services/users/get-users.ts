import { api } from '@/lib/api'
import type { User } from '@/types/user'
import { useQuery } from '@tanstack/react-query'

export const getUsers = async (name?: string): Promise<User[]> => {
    if (name) {
        const response = await api.get(`/auth/users?name=${name}`)
        return response.data
    }
    const response = await api.get('/auth/users')
    return response.data
}

export const useGetUsers = (name?: string) => {
    let queryKey = ['users']
    if (name) {
        queryKey = ['users', name]
    }
    const {
        data: users,
        isPending,
        error,
        refetch
    } = useQuery({
        queryKey: queryKey,
        queryFn: () => getUsers(name)
    })

    return { users, isPending, error, refetch }
}
