'use client'
import { AppSidebar } from '@/components/layouts/protected-layout'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { queryClient } from '@/lib/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

const AppLayout = ({ children }: { children: ReactNode }) => {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <SidebarProvider>
                    <Toaster richColors theme="light" />
                    <AppSidebar />
                    <main className="w-full">
                        <SidebarTrigger />
                        <div className="p-4 w-full h-full">{children}</div>
                    </main>
                </SidebarProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}

export default AppLayout
