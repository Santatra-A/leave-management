'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const passwordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Le mot de passe doit faire au moins 8 caractères')
            .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
            .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
            .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
        confirmPassword: z.string()
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword']
    })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function UpdatePasswordPage() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [resetToken, setResetToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        mode: 'onBlur'
    })

    const handleVerifyOTP = async () => {
        if (!email || !otp) {
            toast.error('Veuillez saisir email et OTP.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/otpVerification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success('OTP vérifié, vous pouvez maintenant changer votre mot de passe.')
                setResetToken(data.resetToken)
            } else {
                toast.error(data.error || 'OTP invalide')
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la vérification de l’OTP.')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (formData: PasswordFormValues) => {
        if (!resetToken) {
            toast.error('Vous devez d’abord vérifier l’OTP.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/password-recovery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, resetToken, newPassword: formData.newPassword })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success('Mot de passe mis à jour avec succès.')
                // Optionally redirect to login
            } else {
                toast.error(data.error || 'Erreur lors de la mise à jour du mot de passe.')
            }
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-10 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Mettre à jour le mot de passe</h1>
            <div className="space-y-2">
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

            {!resetToken && (
                <>
                    <div className="space-y-2 pb-4">
                        <Label htmlFor="otp">OTP :</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Entrez le code OTP reçu par email"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            Retour à la page de connexion
                        </Button>
                    </Link>
                    <Button onClick={handleVerifyOTP} disabled={loading} className="w-full">
                        {loading ? <LoaderCircle className="animate-spin size-4" /> : 'Vérifier OTP'}
                    </Button>
                </>
            )}

            {resetToken && (
                <form onSubmit={handleSubmit(handleUpdatePassword)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe :</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            placeholder="Nouveau mot de passe"
                            {...register('newPassword')}
                            className={errors.newPassword && 'border border-red-500'}
                            required
                        />
                        {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-2 pb-4">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe :</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            {...register('confirmPassword')}
                            className={errors.confirmPassword && 'border border-red-500'}
                            required
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            Aller à la page de connexion
                        </Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <LoaderCircle className="animate-spin size-4" /> : 'Mettre à jour'}
                    </Button>
                </form>
            )}
        </div>
    )
}
