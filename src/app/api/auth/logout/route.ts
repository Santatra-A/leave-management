import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { type NextRequest, NextResponse } from 'next/server'

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'your-email@example.com'
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error('Email and password are required')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    throw new Error('No user found with the given email')
                }

                const isValid = await compare(credentials.password, user.password)
                if (!isValid) {
                    throw new Error('Invalid password')
                }

                // Return user object without password
                const { password, ...userWithoutPassword } = user
                return userWithoutPassword
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    jwt: {
        secret: process.env.JWT_SECRET
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.role = user.role
                token.tokenVersion = user.tokenVersion
            }

            // When using tokenVersion for invalidation
            if (token.tokenVersion) {
                const currentUser = await prisma.user.findUnique({
                    where: { id: token.id as string }
                })
                if (currentUser && currentUser.tokenVersion !== token.tokenVersion) {
                    return {}
                }
            }

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.role = token.role as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login'
    }
}
export async function POST(req: NextRequest) {
    // Retrieve the current session
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        // Increment tokenVersion to invalidate existing tokens
        await prisma.user.update({
            where: { email: session.user.email },
            data: { tokenVersion: user.tokenVersion + 1 }
        })

        // Optionally, perform additional cleanup (e.g., logging)

        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}
