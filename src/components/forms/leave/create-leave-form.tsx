import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCreateLeave } from '@/services/leaves/create-leave'
import { useGetUserByID } from '@/services/users/get-user-by-id'
import { format } from 'date-fns'
import { LoaderCircle, PlusCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function CreateLeaveForm() {
    const { data: session, status } = useSession()
    const userId = session?.user?.id
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState<{
        startDate: Date | null
        endDate: Date | null
        reason: string
    }>({
        startDate: null,
        endDate: null,
        reason: ''
    })

    const { user, isPending, error: userError, refetch } = useGetUserByID(userId)
    const { createMutation, onSubmit } = useCreateLeave()

    useEffect(() => {
        refetch()
        if (createMutation.isSuccess) setOpen(false)
    }, [createMutation.isSuccess])

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, reason: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!userId) {
            console.error('User ID is not available')
            return
        }
        if (!formData.startDate || !formData.endDate) {
            console.error('Dates are required')
            return
        }
        onSubmit(userId, formData.startDate, formData.endDate, formData.reason)
    }

    if (status === 'loading' || isPending) {
        return <div className="text-center text-sm">Chargement...</div>
    }

    if (userError) {
        return <div className="text-center text-sm text-red-500">Erreur lors du chargement des données utilisateur.</div>
    }

    if (!user) {
        return <div className="text-center text-sm text-red-500">Utilisateur non trouvé.</div>
    }

    return (
        <Drawer
            open={open}
            onOpenChange={(o) => {
                setOpen(o)
                if (!o) {
                    setFormData({
                        startDate: null,
                        endDate: null,
                        reason: ''
                    })
                }
            }}
        >
            <DrawerTrigger asChild>
                <Button size="sm" className="h-7 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Demander congé</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto max-w-screen-md w-full max-h-[calc(100vh_-_2rem)] overflow-y-auto">
                    <DrawerHeader className="sticky h-fit top-0 bg-background p-4 z-20">
                        <DrawerTitle className="text-2xl font-heading font-bold text-center">Soumettre une demande de congé</DrawerTitle>
                        <DrawerDescription className="text-center">Les informations ci-dessous sont nécessaires.</DrawerDescription>
                        <DrawerDescription className="text-center">Vous avez {user?.totalLeaveDays} jours de congés par année.</DrawerDescription>
                        <DrawerDescription className="text-center">Vous avez {user?.remainingLeaveDays} jours restants à demander.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Start Date Picker */}
                                <div className="grid gap-2">
                                    <Label>Date de début :</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !formData.startDate && 'text-muted-foreground'
                                                )}
                                            >
                                                {formData.startDate ? format(formData.startDate, 'PPP') : 'Choisir une date de début'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.startDate || undefined}
                                                onSelect={(date) => setFormData((prev: any) => ({ ...prev, startDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* End Date Picker */}
                                <div className="grid gap-2">
                                    <Label>Date de fin :</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !formData.endDate && 'text-muted-foreground'
                                                )}
                                            >
                                                {formData.endDate ? format(formData.endDate, 'PPP') : 'Choisir une date de fin'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.endDate || undefined}
                                                onSelect={(date) => setFormData((prev: any) => ({ ...prev, endDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Raison :</Label>
                                    <Textarea
                                        name="reason"
                                        placeholder="Raison"
                                        value={formData.reason}
                                        onChange={handleReasonChange}
                                        required
                                        className="w-full"
                                    />
                                </div>
                                <div className="grid gap-2 pb-2">
                                    <Button type="submit" size={'lg'} className="w-full font-bold">
                                        {createMutation.isPending ? <LoaderCircle className="animate-spin size-4" /> : 'Soumettre la demande'}
                                    </Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" size={'lg'} className="w-full font-bold">
                                            Annuler
                                        </Button>
                                    </DrawerClose>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
