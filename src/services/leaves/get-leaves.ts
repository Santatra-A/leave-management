import { api } from '@/lib/api'
import type { LeaveResponse } from '@/types/leave'
import { useQuery } from '@tanstack/react-query'

export const getLeaves = async (): Promise<LeaveResponse[]> => {
    const response = await api.get('/leaves')
    return response.data
}

export const useGetLeaves = () => {
    const {
        data: leaves,
        isPending,
        error,
        refetch
    } = useQuery({
        queryKey: ['leaves'],
        queryFn: getLeaves
    })

    return { leaves, isPending, error, refetch }
}
