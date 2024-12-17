// src/app/api/auth/verify/route.ts
import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.json({ message: 'Verification token is required' }, { status: 400 })
    }

    // Find user by token
    const user = await prisma.user.findUnique({
        where: { verificationToken: token }
    })

    if (!user) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 400 })
    }

    // Update user to verified
    await prisma.user.update({
        where: { id: user.id },
        data: {
            isVerified: true,
            verificationToken: null
        }
    })

    // Redirect to success page with a query parameter
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verify/success?verified=1`)
}
