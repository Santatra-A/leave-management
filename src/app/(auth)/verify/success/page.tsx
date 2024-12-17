import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'

export default function VerifySuccessPage({ searchParams }: { searchParams: { [key: string]: string } }) {
    if (searchParams.verified !== '1') {
        redirect('/')
    }
    return (
        <div className="flex flex-col justify-center items-center gap-4 h-[100dvh]">
            <h1 className="text-xl xl:text-4xl text-green-600 uppercase">Compte vérifié!</h1>
            <p>Votre compte a été vérifié et confirmé. Vous pouvez maintenant vous connecter.</p>
            <Link href="/login">
                <Button>Se connecter</Button>
            </Link>
        </div>
    )
}
