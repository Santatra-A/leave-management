'use client'
import SignupForm from '@/components/forms/auth/signup-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignupPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return
        if (session) router.push('/')
    }, [session, status])

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md shadow-none border-0">
                <CardHeader>
                    <div className="flex justify-center items-center w-full">
                        <Image src="/dgbf.jpeg" alt="logo" width={200} height={200} />
                    </div>
                    <CardTitle className="text-center text-xl">S'enregistrer</CardTitle>
                    <CardDescription className="text-center">Créer votre compte dgbf</CardDescription>
                </CardHeader>
                <CardContent>
                    <SignupForm />
                    <div className="mt-4 text-center text-sm">
                        Vous avez déjà un compte ?{' '}
                        <Link href="/login" className="text-blue-500 hover:underline">
                            Se connecter
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
