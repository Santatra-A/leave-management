import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { type NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
    return NextResponse.json({ message: 'Signup endpoint' }, { status: 200 })
}

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json()

        if (!email || !password || !name) {
            return NextResponse.json({ message: 'Votre adresse mail, mot de passe et nom complet sont requis !' }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ message: 'Utilisateur déjà inscrit' }, { status: 409 })
        }

        // Hash the password
        const hashedPassword = await hash(password, 12)

        // Generate a verification token
        const verificationToken = randomBytes(32).toString('hex')

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verificationToken
            }
        })

        // Send verification email
        await sendVerificationEmail(email, verificationToken)

        return NextResponse.json(
            {
                message:
                    'Utilisateur crée avec succès, veuillez vérifier votre email pour activer votre compte. Un email de vérification a été envoyé.',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

async function sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify?token=${token}`

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Verifier votre compte',
        html: `
            <p>Merci de vous avoir inscrit sur la plateforme, ceci est un email de confirmation de la création de votre compte: </p>
            <a
                href="${verificationUrl}"
                style="display:inline-block;padding:10px 20px;color:#ffffff;background:#0070f3;text-decoration:none;border-radius:5px;"
            >
            Confirmer mon compte
            </a>
            <p>Si vous n'avez pas demandé à avoir cet email, vous pouvez simplement l'ignorer.</p>
        `
    }

    await transporter.sendMail(mailOptions)
}
