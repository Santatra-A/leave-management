'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import { useGetUsers } from '@/services/users/get-users'
import { useUpdateUser } from '@/services/users/update-user'
import type { User } from '@/types/user'
import { AlertCircleIcon, CheckCircleIcon, ChevronLeft, ChevronRight, LoaderCircle, Pencil } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Users() {
    const [name, setName] = useState<string | undefined>(undefined)
    const router = useRouter()
    const { data: session, status } = useSession()
    const debouncedSearch = useDebounce(name)
    const { users, isPending, error } = useGetUsers(debouncedSearch)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [newTotalLeaveDays, setNewTotalLeaveDays] = useState<number>(0)
    const [newRemainingLeaveDays, setNewRemainingLeaveDays] = useState<number>(0)
    const [newUserRole, setNewUserRole] = useState<string>('')
    const { updateMutation, onSubmit } = useUpdateUser(newTotalLeaveDays, newRemainingLeaveDays, newUserRole)

    useEffect(() => {
        if (status === 'loading') return
        if (session?.user.role === 'user') {
            router.push('/')
        }
        if (updateMutation.isSuccess) handleCloseDialog()
    }, [session, status, updateMutation.isSuccess])

    const handleOpenDialog = (user: User | null) => {
        setSelectedUser(user)
        setNewTotalLeaveDays(user?.totalLeaveDays!)
        setNewRemainingLeaveDays(user?.remainingLeaveDays!)
        setNewUserRole(user?.role!)
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setSelectedUser(null)
        setNewTotalLeaveDays(0)
        setNewRemainingLeaveDays(0)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedUser) {
            onSubmit(selectedUser)
        }
    }

    return (
        <div className="space-y-6 p-8 bg-white max-w-full overflow-hidden">
            <h1 className="text-2xl font-semibold text-left">Utilisateurs</h1>
            <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rechercher un utilisateur par son nom..."
                className="bg-transparent py-4 w-1/2 text-secondary-foreground focus:outline-none"
                data-autofocus
            />
            <Card>
                <CardHeader>
                    <CardTitle>Liste des utilisateurs dans la plateforme</CardTitle>
                    <CardDescription>Gérer les utilisateurs</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh]">
                        <Table className="min-w-full table-fixed">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="size-1/7 py-4">Nom complet</TableHead>
                                    <TableHead className="size-1/7">Email</TableHead>
                                    <TableHead className="size-1/7">Total de jour de congé par année</TableHead>
                                    <TableHead className="size-1/7">Jours de congés restants</TableHead>
                                    <TableHead className="size-1/7">Role</TableHead>
                                    <TableHead className="size-1/7">Statut</TableHead>
                                    <TableHead className="size-1/7">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isPending ? (
                                    <>
                                        {Array.from({ length: 10 }).map((_, index) => (
                                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                            <TableRow key={index}>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-red-600">
                                            {error.message}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users?.map((user: User) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="w-full overflow-hidden text-ellipsis">{user.name}</TableCell>
                                            <TableCell className="w-full overflow-hidden text-ellipsis">{user.email}</TableCell>
                                            <TableCell className="w-full text-center">{user.totalLeaveDays}</TableCell>
                                            <TableCell className="w-full text-center">{user.remainingLeaveDays}</TableCell>
                                            <TableCell className="w-full">
                                                {user.role === 'admin' ? (
                                                    <Badge className="bg-green-600 hover:bg-green-700">Administrateur</Badge>
                                                ) : (
                                                    <Badge>Utilisateur</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-full">
                                                {user.isVerified ? (
                                                    <span className="text-green-500 flex gap-2 items-center">
                                                        <CheckCircleIcon className="size-4" /> Vérifié
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex gap-2 items-center">
                                                        <AlertCircleIcon className="size-4" /> Non-vérifié
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-full ">
                                                <Button variant="outline" size="icon" className="rounded-full" onClick={() => handleOpenDialog(user)}>
                                                    <Pencil />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="flex justify-between items-center">
                                            <div className="text-xs text-muted-foreground">
                                                Page <strong>1-max Pages</strong>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline">
                                                    <ChevronLeft />
                                                </Button>
                                                <Button size="icon" variant="outline">
                                                    <ChevronRight />
                                                </Button>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier les jours de congé de {selectedUser?.name || "l'utilisateur"}</DialogTitle>
                        <DialogDescription>Entrez le nouveau nombre total de jours de congé par année.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4">
                            <Select onValueChange={(value) => setNewUserRole(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Modifier le rôle de l'utilisateur" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Rôle</SelectLabel>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                        <SelectItem value="user">Utilisateur</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="totalLeaveDays" className="block text-sm font-medium text-gray-700">
                                Total de jours de congé
                            </label>
                            <Input
                                id="totalLeaveDays"
                                type="number"
                                min={0}
                                value={newTotalLeaveDays}
                                onChange={(e) => setNewTotalLeaveDays(Number(e.target.value))}
                                required
                                className="mt-1 block w-full"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="totalLeaveDays" className="block text-sm font-medium text-gray-700">
                                Jours de congés restants
                            </label>
                            <Input
                                id="remainingLeaveDays"
                                type="number"
                                min={0}
                                value={newRemainingLeaveDays}
                                onChange={(e) => setNewRemainingLeaveDays(Number(e.target.value))}
                                required
                                className="mt-1 block w-full"
                            />
                        </div>
                        <DialogFooter className="mt-6 flex justify-end space-x-4">
                            <Button type="button" variant="ghost" onClick={handleCloseDialog} disabled={updateMutation.isPending}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? <LoaderCircle className="animate-spin size-4" /> : 'Mettre à jour'}
                            </Button>
                        </DialogFooter>
                    </form>
                    {updateMutation.isError && <p className="mt-2 text-red-600">Une erreur est survenue.</p>}
                </DialogContent>
            </Dialog>
        </div>
    )
}
