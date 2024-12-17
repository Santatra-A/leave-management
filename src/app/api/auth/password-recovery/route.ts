import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const { email, resetToken, newPassword } = await request.json()

    if (!email || !resetToken || !newPassword) {
        return NextResponse.json({ error: 'Email, resetToken, and newPassword are required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return NextResponse.json({ error: 'No user found with this email.' }, { status: 404 })
    }

    // Check the reset token
    if (!user.verificationToken || user.verificationToken !== resetToken) {
        return NextResponse.json({ error: 'Invalid reset token.' }, { status: 400 })
    }

    // Update the password
    const hashedPassword = await hash(newPassword, 12)
    await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            verificationToken: null // Clear the token
        }
    })

    return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 })
}
