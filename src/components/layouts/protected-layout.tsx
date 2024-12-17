import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar'
import { logout } from '@/hooks/use-logout'
import { LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

const items = [
    {
        title: 'Congés',
        url: '/',
        roles: ['user', 'admin']
    },
    {
        title: 'Utilisateurs',
        url: '/users',
        roles: ['admin']
    }
]

export function AppSidebar() {
    const { data: session, status } = useSession()
    const pathname = usePathname()

    const handleLogout = async () => {
        try {
            await logout()
            signOut({ callbackUrl: '/login' })
        } catch (error: any) {
            toast.error(error.message || 'Logout failed')
        }
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup className="space-y-8">
                    <div className="w-full grid place-items-center">
                        <Image src="/dgbf.jpeg" alt="logo" width={200} height={200} />
                    </div>
                    <SidebarGroupLabel className="uppercase font-bold text-primary text-lg">Gestion de congés des employés</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {status === 'loading' ? (
                                <>
                                    <Skeleton className="w-full h-7" />
                                    <Skeleton className="w-full h-7" />
                                    <Skeleton className="w-full h-7" />
                                </>
                            ) : (
                                <>
                                    {items
                                        .filter((item) => item.roles.includes(session?.user!.role!))
                                        .map((item) => {
                                            const isActive = pathname === item.url
                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        className={
                                                            isActive
                                                                ? 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground duration-200'
                                                                : ''
                                                        }
                                                        disabled={isActive}
                                                    >
                                                        <Link href={item.url}>
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="space-y-2">
                    {status === 'loading' ? (
                        <Skeleton className="w-full h-7" />
                    ) : (
                        <h1 className="font-bold text-center text-lg overflow-hidden text-ellipsis">{session?.user?.name}</h1>
                    )}
                    {status === 'loading' ? (
                        <Skeleton className="w-full h-7" />
                    ) : (
                        <h1 className="text-center text-xs overflow-hidden text-ellipsis">{session?.user?.email}</h1>
                    )}
                </div>
                {session?.user?.role === 'admin' && (
                    <Badge className="grid place-items-center uppercase text-center bg-green-600 hover:bg-green-700 duration-200 rounded-full">
                        <h1>Administrateur</h1>
                    </Badge>
                )}
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut />
                    Se déconnecter
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}
