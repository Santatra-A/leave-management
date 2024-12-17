import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const signupSchema = z.object({
    name: z.string().nonempty('Veuillez saisir votre nom complet').max(50, 'Le nom complet ne doit pas dépasser 50 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z
        .string()
        .min(8, 'Le mot de passe doit faire au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial')
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupForm() {
    const [loading, setLoading] = useState(false)

    const {
        register,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur'
    })

    const onSubmit = async (data: SignupFormValues) => {
        setLoading(true)
        try {
            const response = await api.post('/auth/signup', data)
            if (response.status === 201) {
                toast.success('Vérifiez votre email pour confirmer la création de votre compte', { duration: 10000 })
                reset()
            } else {
                throw new Error(response.data.message || 'Something went wrong')
            }
        } catch (err: any) {
            let message = 'Something went wrong'
            if (err.response?.data?.message) {
                message = err.response.data.message
            } else if (err.message) {
                message = err.message
            }
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom complet :</Label>
                <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Entrer votre Nom complet"
                    {...register('name')}
                    className={errors.name && 'border-red-500 border'}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email :</Label>
                <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Entrer votre adresse mail"
                    {...register('email')}
                    className={errors.email && 'border-red-500 border'}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Mot de passe :</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Entrer votre mot de passe"
                    {...register('password')}
                    className={errors.password && 'border-red-500 border'}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin size-4" /> : "S'enregistrer"}
            </Button>
        </form>
    )
}
