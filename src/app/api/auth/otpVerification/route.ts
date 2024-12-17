import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import nodemailer from 'nodemailer'

async function sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
    })
}

export async function POST(request: NextRequest) {
    const { email, otp } = await request.json()

    if (!email) {
        return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return NextResponse.json({ error: 'No user found with this email.' }, { status: 404 })
    }

    // If OTP is not provided, generate and send a new one
    if (!otp) {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit OTP
        // Store OTP in verificationToken
        await prisma.user.update({
            where: { email },
            data: { verificationToken: generatedOtp }
        })

        // Send email with OTP
        const html = `
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Voici votre code de vérification (OTP) : <strong>${generatedOtp}</strong></p>
            <p>Ce code est valable pendant une courte période.</p>
        `
        await sendEmail(email, 'Code de vérification (réinitialisation de mot de passe)', html)

        return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200 })
    }

    // If OTP is provided, verify it
    if (otp) {
        if (!user.verificationToken || user.verificationToken !== otp) {
            return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 })
        }

        // If OTP is correct, generate a reset token
        const resetToken = randomBytes(32).toString('hex')

        // Store this resetToken in verificationToken for now
        await prisma.user.update({
            where: { email },
            data: { verificationToken: resetToken }
        })

        return NextResponse.json({ message: 'OTP verified.', resetToken }, { status: 200 })
    }

    return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
}
