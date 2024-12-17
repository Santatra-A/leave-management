import { prisma } from '@/lib/prisma'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: any) {
    const { id } = params

    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing user ID.' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                remainingLeaveDays: true,
                totalLeaveDays: true,
                role: true,
                isVerified: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 })
        }

        return NextResponse.json(user, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: any) {
    const { id } = params

    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing user ID.' }, { status: 400 })
    }

    try {
        const body: {
            totalLeaveDays: number
            remainingLeaveDays: number
            role: string
        } = await request.json()

        if (!body || typeof body.totalLeaveDays !== 'number' || body.totalLeaveDays < 0) {
            return NextResponse.json({ error: 'Invalid payload. "totalLeaveDays" must be a non-negative number.' }, { status: 400 })
        }

        if (body.remainingLeaveDays > body.totalLeaveDays) {
            return NextResponse.json(
                { error: 'Nombre de jours de congés restants doit être inférieur au total de jours de congés assignés! ' },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                totalLeaveDays: body.totalLeaveDays,
                remainingLeaveDays: body.remainingLeaveDays,
                role: body.role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                remainingLeaveDays: true,
                totalLeaveDays: true
            }
        })

        return NextResponse.json(updatedUser, { status: 200 })
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 })
    }
}
