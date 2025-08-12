import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      clientEmail, 
      appointmentType, 
      subject, 
      description, 
      date, 
      time, 
      duration,
      createdByAM,
      amId 
    } = body

    console.log("📝 Création de rendez-vous:", { 
      clientEmail, 
      appointmentType, 
      subject, 
      createdByAM, 
      amId 
    })

    // Validation des champs requis
    if (!clientEmail || !subject || !date || !time) {
      return NextResponse.json(
        { message: "Email client, sujet, date et heure sont requis" },
        { status: 400 }
      )
    }

    // Rechercher le client par email
    const user = await prisma.user.findUnique({
      where: { email: clientEmail },
      include: {
        clientAccount: {
          include: {
            company: true
          }
        }
      }
    })

    if (!user?.clientAccount) {
      return NextResponse.json(
        { message: "Client non trouvé pour cet email" },
        { status: 404 }
      )
    }

    // Calculer l&apos;heure de fin basée sur la durée
    const startTime = new Date(`${date}T${time}`)
    const endTime = new Date(startTime.getTime() + (parseInt(duration) || 60) * 60000)

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        clientAccountId: user.clientAccount.id,
        accountManagerId: createdByAM ? amId : null,
        title: subject,
        description: description || "",
        startTime,
        endTime,
        status: "SCHEDULED"
      }
    })

    console.log("✅ Rendez-vous créé:", appointment.id)

    return NextResponse.json({
      message: "Rendez-vous créé avec succès",
      appointment: {
        id: appointment.id,
        title: appointment.title,
        startTime: appointment.startTime,
        status: appointment.status
      }
    })

  } catch (error) {
    console.error("Erreur lors de la création du rendez-vous:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 