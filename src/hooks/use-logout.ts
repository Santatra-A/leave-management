import { api } from '@/lib/api'

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout')
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Logout failed')
    }
}
