import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const leaves = await prisma.leave.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(leaves, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la récupération des congés.' }, { status: 500 })
    }
}

const ERROR_MESSAGES = {
    MISSING_FIELDS: 'Tous les champs sont requis.',
    USER_NOT_FOUND: 'Utilisateur non trouvé.',
    OVERLAPPING_LEAVE: 'Vous avez déjà un congé approuvé pour cette période ou inclus une partie de celle-ci.',
    PAST_PERIOD: 'La période demandée est déjà passée.',
    INVALID_DATE_RANGE: 'La date de fin doit être après la date de début.',
    EXCEEDS_REMAINING_DAYS: 'Nombre de jours de congés disponibles insuffisants.'
}

function jsonResponse(error: string, status: number) {
    return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
    try {
        const { userId, startDate, endDate, reason } = await request.json()

        if (!userId || !startDate || !endDate || !reason) {
            return jsonResponse(ERROR_MESSAGES.MISSING_FIELDS, 400)
        }

        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            return jsonResponse(ERROR_MESSAGES.USER_NOT_FOUND, 404)
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const today = new Date()

        if (end < today) {
            return jsonResponse(ERROR_MESSAGES.PAST_PERIOD, 400)
        }

        const overlappingLeave = await prisma.leave.findFirst({
            where: {
                userId,
                status: 'APPROVED',
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start }
                    }
                ]
            }
        })

        if (overlappingLeave) {
            return jsonResponse(ERROR_MESSAGES.OVERLAPPING_LEAVE, 400)
        }

        const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1

        if (daysRequested <= 0) {
            return jsonResponse(ERROR_MESSAGES.INVALID_DATE_RANGE, 400)
        }

        if (daysRequested > user.remainingLeaveDays) {
            return jsonResponse(ERROR_MESSAGES.EXCEEDS_REMAINING_DAYS, 400)
        }

        const leave = await prisma.leave.create({
            data: {
                user: { connect: { id: userId } },
                startDate: start,
                endDate: end,
                reason
            }
        })

        return NextResponse.json(leave, { status: 201 })
    } catch (error) {
        return jsonResponse('Erreur lors de la création du congé.', 500)
    }
}
