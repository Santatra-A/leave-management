'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { createReport } from '@/services/report/create-report'
import axios from 'axios'
import { format } from 'date-fns'
import { File, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const ReportForm = () => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [htmlFilename, setHtmlFilename] = useState<string | null>(null)
    const [pdfFilename, setPdfFilename] = useState<string | null>(null)
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)

    const handleGenerateReport = async () => {
        if (!startDate || !endDate) {
            toast.error('Veuillez sélectionner les dates de début et de fin.')
            return
        }

        if (startDate > endDate) {
            toast.error('La date de début ne peut pas être postérieure à la date de fin.')
            return
        }

        setLoading(true)
        setError(null)
        setHtmlFilename(null)
        setPdfFilename(null)

        try {
            const response = await createReport({
                appName: 'Congés',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            })

            const { html, pdf } = response

            if (!html || !pdf) {
                throw new Error('Les noms des fichiers HTML et PDF ne sont pas renvoyés par le serveur.')
            }

            setHtmlFilename(html)
            setPdfFilename(pdf)
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erreur lors de la génération du rapport')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (filename: string) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_REPORTING_SERVICE_URL}/reports/download/${encodeURIComponent(filename)}`

            const response = await axios.get(url, {
                responseType: 'blob'
            })

            console.log(`Taille du blob pour ${filename}:`, response.data.size)
            console.log(`Type de contenu pour ${filename}:`, response.headers['content-type'])

            if (response.status !== 200) {
                throw new Error(`Erreur lors du téléchargement: Statut ${response.status}`)
            }

            const blob = new Blob([response.data], { type: response.headers['content-type'] })
            const link = document.createElement('a')
            const urlObject = window.URL.createObjectURL(blob)
            link.href = urlObject
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(urlObject)
            setOpen(false)
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error)
            setError('Erreur lors du téléchargement du rapport')
        }
    }

    return (
        <Drawer
            open={open}
            onOpenChange={(o) => {
                setOpen(o)
                if (!o) {
                    setStartDate(null)
                    setEndDate(null)
                    setHtmlFilename(null)
                    setPdfFilename(null)
                    setError(null)
                }
            }}
        >
            <DrawerTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Rapport</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto max-w-screen-md w-full max-h-[calc(100vh_-_2rem)] overflow-y-auto">
                    <DrawerHeader className="sticky h-fit top-0 bg-background p-4 z-20">
                        <DrawerTitle className="text-2xl font-heading font-bold text-center">Générer un rapport de congés</DrawerTitle>
                        <DrawerDescription className="text-center">Les informations ci-dessous sont nécessaires.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="grid gap-2 pb-2">
                            <div>
                                <Label>Date de début :</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}
                                        >
                                            {startDate ? format(startDate, 'PPP') : 'Choisir la date de début'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate || undefined}
                                            onSelect={(date: any) => setStartDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <Label>Date de fin :</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}
                                        >
                                            {endDate ? format(endDate, 'PPP') : 'Choisir la date de fin'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate || undefined}
                                            onSelect={(date: any) => setEndDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid gap-2 pb-2">
                            <Button onClick={handleGenerateReport} size={'lg'} className="w-full font-bold">
                                {loading ? <LoaderCircle className="animate-spin size-4" /> : 'Générer Rapport'}
                            </Button>
                            {pdfFilename && (
                                <Button variant="ghost" onClick={() => handleDownload(pdfFilename)}>
                                    Télécharger le rapport PDF
                                </Button>
                            )}
                            <DrawerClose asChild>
                                <Button variant="outline" size={'lg'} className="w-full font-bold">
                                    Annuler
                                </Button>
                            </DrawerClose>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ReportForm
