'use client'
import { useProtectedRoute } from '@/hooks/use-protected-route'
import type { ReactNode } from 'react'

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
    useProtectedRoute()
    return <>{children}</>
}

export default ProtectedLayout
