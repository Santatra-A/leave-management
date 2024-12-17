import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: any) {
    const { id } = params

    try {
        const { status } = await request.json()

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: 'Statut invalide.' }, { status: 400 })
        }

        const leave = await prisma.leave.findUnique({ where: { id }, include: { user: true } })
        if (!leave) {
            return NextResponse.json({ error: 'Congé non trouvé.' }, { status: 404 })
        }

        if (leave.status !== 'PENDING') {
            return NextResponse.json({ error: 'Seules les demandes en attente peuvent être modifiées.' }, { status: 400 })
        }

        let updatedUser: any
        if (status === 'APPROVED') {
            const start = new Date(leave.startDate)
            const end = new Date(leave.endDate)
            const timeDiff = end.getTime() - start.getTime()
            const daysTaken = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

            if (daysTaken > leave.user.remainingLeaveDays) {
                return NextResponse.json({ error: "Le nombre de jours pris dépasse les jours restants de l'utilisateur." }, { status: 400 })
            }

            updatedUser = await prisma.user.update({
                where: { id: leave.userId },
                data: {
                    remainingLeaveDays: {
                        decrement: daysTaken
                    }
                }
            })
        }

        const updatedLeave = await prisma.leave.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updatedLeave, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour du statut.' }, { status: 500 })
    }
}
