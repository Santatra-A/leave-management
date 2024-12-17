import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Adresse email invalide'),
    password: z.string().min(8, 'Le mot de passe doit comporter au moins 8 caractères')
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur'
    })

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true)

        const res = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password
        })

        setLoading(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            router.push('/')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Adresse mail :</Label>
                <Input
                    id="email"
                    type="email"
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
                    placeholder="Entrer votre mot de passe"
                    {...register('password')}
                    className={errors.password && 'border-red-500 border'}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin size-4" /> : 'Se connecter'}
            </Button>
        </form>
    )
}
