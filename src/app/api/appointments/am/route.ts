import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const amId = searchParams.get('amId')

    if (!amId) {
      return NextResponse.json(
        { message: "ID de l'Account Manager requis" },
        { status: 400 }
      )
    }

    console.log("🔍 Récupération des RDV pour AM:", amId)

    const appointments = await prisma.appointment.findMany({
      where: {
        accountManagerId: amId
      },
      include: {
        clientAccount: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    console.log("✅ RDV trouvés:", appointments.length)

    return NextResponse.json({
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        client: {
          name: `${appointment.clientAccount.user.firstName} ${appointment.clientAccount.user.lastName}`,
          email: appointment.clientAccount.user.email,
          company: appointment.clientAccount.company.name
        }
      }))
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des RDV:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 