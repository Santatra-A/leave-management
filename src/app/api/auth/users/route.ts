import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const name = request.nextUrl.searchParams.get('name')
        const users = await prisma.user.findMany({
            where: name ? { name: { contains: name } } : {},
            select: { id: true, name: true, email: true, remainingLeaveDays: true, role: true, totalLeaveDays: true, isVerified: true },
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs.' }, { status: 500 })
    }
}
