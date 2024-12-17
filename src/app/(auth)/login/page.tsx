'use client'
import LoginForm from '@/components/forms/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return
        if (session) router.push('/')
    }, [session, status])

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md border-0 shadow-none">
                <CardHeader>
                    <div className="flex justify-center items-center w-full">
                        <Image src="/dgbf.jpeg" alt="logo" width={200} height={200} />
                    </div>
                    <CardTitle className="text-center text-xl">Connectez-vous à votre compte</CardTitle>
                    <CardDescription className="text-center">Application de Gestion de congés</CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                        Vous n'avez pas encore de compte ?{' '}
                        <Link href="/signup" className="text-blue-500 hover:underline">
                            S'enregistrer
                        </Link>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Mot de passe oublié ?{' '}
                        <Link href="/recovery" className="text-blue-500 hover:underline">
                            Récupérer
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
