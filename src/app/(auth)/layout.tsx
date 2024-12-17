'use client'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <Toaster richColors theme="light" />
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}

export default Layout
