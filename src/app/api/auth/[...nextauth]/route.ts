import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

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

                if (!user.isVerified) {
                    throw new Error('Votre compte n’est pas encore vérifié. Veuillez vérifier votre e-mail.')
                }

                const isValid = await compare(credentials.password, user.password)
                if (!isValid) {
                    throw new Error('Invalid password')
                }

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

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
