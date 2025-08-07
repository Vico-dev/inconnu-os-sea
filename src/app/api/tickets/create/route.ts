import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { validateData, createTicketSchema } from "@/lib/validations"
import { rateLimiters } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimiters.tickets(request)
  if (rateLimitResult) {
    return rateLimitResult
  }
  try {
    console.log("🔍 Début de la création de ticket")
    const body = await request.json()
    
    // Validation avec Zod
    const validation = validateData(createTicketSchema, body)
    if (!validation.success) {
      console.log("❌ Validation échouée:", validation.error)
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      )
    }

    const { subject, category, priority, description } = validation.data
    const { userId, clientEmail, createdByAM, amId } = body
    
    console.log("📝 Données reçues:", { userId, clientEmail, createdByAM, amId, subject, category, priority, description })

    let clientAccount

    if (createdByAM && clientEmail) {
      // Création par un AM - chercher le client par email
      console.log("👨‍💼 Création par AM, recherche client par email:", clientEmail)
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
        console.log("❌ Client non trouvé pour l'email:", clientEmail)
        return NextResponse.json(
          { message: "Client non trouvé pour cet email" },
          { status: 404 }
        )
      }

      clientAccount = user.clientAccount
      console.log("✅ Client trouvé:", clientAccount.id)
    } else {
      // Création par un client - utiliser userId
      if (!userId) {
        console.log("❌ userId manquant")
        return NextResponse.json(
          { message: "ID utilisateur requis" },
          { status: 400 }
        )
      }

      console.log("🔍 Recherche du compte client pour userId:", userId)
      clientAccount = await prisma.clientAccount.findUnique({
        where: { userId },
        include: {
          company: {
            include: {
              accountManagers: true
            }
          }
        }
      })

      if (!clientAccount) {
        console.log("❌ Compte client non trouvé")
        return NextResponse.json(
          { message: "Compte client non trouvé" },
          { status: 404 }
        )
      }
    }

    // Créer le ticket avec AM si créé par un AM
    console.log("🎫 Création du ticket")
    const ticket = await prisma.ticket.create({
      data: {
        clientAccountId: clientAccount.id,
        accountManagerId: createdByAM ? amId : null,
        subject,
        description,
        category,
        priority,
        status: "OPEN"
      }
    })
    console.log("✅ Ticket créé avec succès:", ticket.id)

    return NextResponse.json({
      message: "Ticket créé avec succès",
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.createdAt,
        accountManager: null
      }
    })

  } catch (error) {
    console.error("Erreur lors de la création du ticket:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 