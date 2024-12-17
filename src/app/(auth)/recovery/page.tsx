'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RecoveryPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/otpVerification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success('OTP envoyé à votre adresse mail. Vérifiez votre boîte de réception.')
            } else {
                toast.error(data.error || 'Erreur lors de la génération de l’OTP.')
            }
        } catch (error: any) {
            toast.error(error.message || 'Une erreur est survenue.')
        } finally {
            setLoading(false)
            redirect('/update-password')
        }
    }

    return (
        <div className="max-w-md mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">Récupération de mot de passe</h1>
            <p className="mb-4">Veuillez saisir votre adresse mail pour recevoir un code (OTP) de vérification.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 pb-4">
                    <Label htmlFor="email">Adresse mail :</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="votre-email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <Link href="/login">
                    <Button variant="outline" className="w-full">
                        Retour à la page de connexion
                    </Button>
                </Link>
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <LoaderCircle className="animate-spin size-4" /> : 'Envoyer OTP'}
                </Button>
            </form>
        </div>
    )
}
