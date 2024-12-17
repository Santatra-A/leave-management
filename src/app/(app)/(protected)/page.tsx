'use client'
import CreateLeaveForm from '@/components/forms/leave/create-leave-form'
import ReportForm from '@/components/forms/report/report-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useGetLeaves } from '@/services/leaves/get-leaves'
import { useUpdateLeaveStatus } from '@/services/leaves/update-leave-status'
import type { LeaveResponse } from '@/types/leave'
import { formatDate } from '@/utils/formatDate'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function Leaves() {
    const { data: session, status } = useSession()
    const { updateMutation: approveMutation, onSubmit: onApprovedSubmit } = useUpdateLeaveStatus('APPROVED')
    const { updateMutation: rejectMutation, onSubmit: onRejectedSubmit } = useUpdateLeaveStatus('REJECTED')
    const { leaves, isPending, error, refetch } = useGetLeaves()

    useEffect(() => {
        refetch()
    }, [])

    const handleUpdate = (leave: LeaveResponse, action: 'APPROVED' | 'REJECTED') => {
        if (action === 'APPROVED') {
            onApprovedSubmit(leave)
        } else {
            onRejectedSubmit(leave)
        }
    }

    return (
        <div className="space-y-6 p-8 max-w-full overflow-hidden">
            <h1 className="text-2xl font-semibold text-left">Congés</h1>
            <div className="flex justify-between gap-4">
                <div>
                    <Input placeholder="Rechercher par adresse mail ..." />
                </div>
                <div className="flex items-center gap-4">
                    {session?.user.role === 'admin' && <ReportForm />}
                    <CreateLeaveForm />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Liste des congés</CardTitle>
                    <CardDescription>
                        {status === 'loading'
                            ? 'Chargement ...'
                            : session?.user.role === 'admin'
                              ? 'Gérer les congés des utilisateurs'
                              : 'Historique de vos congés'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[70vh]">
                        <Table className="min-w-full table-fixed">
                            <TableHeader>
                                <TableRow>
                                    {session?.user.role === 'admin' && (
                                        <>
                                            <TableHead className="w-1/7">Utilisateur</TableHead>
                                            <TableHead className="w-1/7">Email</TableHead>
                                        </>
                                    )}
                                    <TableHead className={session?.user.role === 'admin' ? 'w-1/7' : 'w-1/4'}>Début</TableHead>
                                    <TableHead className={session?.user.role === 'admin' ? 'w-1/7' : 'w-1/4'}>Fin</TableHead>
                                    <TableHead colSpan={2}>Raison</TableHead>
                                    <TableHead className={session?.user.role === 'admin' ? 'w-1/7' : 'w-1/4'}>Statut</TableHead>
                                    {session?.user.role === 'admin' && <TableHead className="w-1/7">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isPending ? (
                                    <>
                                        {Array.from({ length: 10 }).map((_, index) => (
                                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                                            <TableRow key={index}>
                                                {session?.user.role === 'admin' && (
                                                    <>
                                                        <TableCell className="w-full">
                                                            <Skeleton className="w-full h-7 rounded-full" />
                                                        </TableCell>
                                                        <TableCell className="w-full">
                                                            <Skeleton className="w-full h-7 rounded-full" />
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell colSpan={2} className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Skeleton className="w-full h-7 rounded-full" />
                                                </TableCell>
                                                {session?.user.role === 'admin' && (
                                                    <TableCell className="w-full">
                                                        <Skeleton className="w-full h-7 rounded-full" />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-red-600 p-48">
                                            {error.message}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaves
                                        ?.filter((leave: LeaveResponse) =>
                                            session?.user.role === 'user' ? leave.user?.name === session?.user.name : true
                                        )
                                        .map((leave: LeaveResponse) => (
                                            <TableRow key={leave.id}>
                                                {session?.user.role === 'admin' && (
                                                    <>
                                                        <TableCell className="w-full overflow-hidden text-ellipsis">{leave.user?.name}</TableCell>
                                                        <TableCell className="w-full overflow-hidden text-ellipsis">{leave.user?.email}</TableCell>
                                                    </>
                                                )}
                                                <TableCell className="w-full">{formatDate(new Date(leave.startDate))}</TableCell>
                                                <TableCell className="w-full">{formatDate(new Date(leave.endDate))}</TableCell>
                                                <TableCell colSpan={2} className="overflow-hidden text-ellipsis">
                                                    {leave.reason}
                                                </TableCell>
                                                <TableCell className="w-full">
                                                    <Badge
                                                        className={`rounded-full ${
                                                            leave.status === 'PENDING'
                                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-primary-foreground'
                                                                : leave.status === 'APPROVED'
                                                                  ? 'bg-green-600 hover:bg-green-700 text-primary-foreground'
                                                                  : 'bg-red-500 hover:bg-red-600 text-primary-foreground'
                                                        }`}
                                                    >
                                                        {leave.status === 'APPROVED'
                                                            ? 'Approuvé'
                                                            : leave.status === 'PENDING'
                                                              ? 'En attente'
                                                              : 'Rejeté'}
                                                    </Badge>
                                                </TableCell>
                                                {session?.user.role === 'admin' && (
                                                    <TableCell className="w-full">
                                                        {leave.status === 'PENDING' && (
                                                            <div className="flex space-x-4">
                                                                <Button
                                                                    size="icon"
                                                                    onClick={() => handleUpdate(leave, 'APPROVED')}
                                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                                    className="rounded-full"
                                                                >
                                                                    <Check />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() => handleUpdate(leave, 'REJECTED')}
                                                                    disabled={rejectMutation.isPending || approveMutation.isPending}
                                                                    className="rounded-full"
                                                                >
                                                                    <X />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                )}
                                <TableRow>
                                    <TableCell colSpan={8}>
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
        </div>
    )
}
