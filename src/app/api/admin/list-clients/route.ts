import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 }
      )
    }

    // Récupérer tous les comptes clients
    const clientAccounts = await prisma.clientAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        },
        assignedAccountManager: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      clients: clientAccounts.map(account => ({
        clientAccountId: account.id,
        userId: account.userId,
        userEmail: account.user.email,
        userName: `${account.user.firstName} ${account.user.lastName}`,
        companyId: account.companyId,
        companyName: account.company.name,
        status: account.status,
        assignedAccountManagerId: account.assignedAccountManagerId,
        assignedAccountManagerName: account.assignedAccountManager?.user
          ? `${account.assignedAccountManager.user.firstName} ${account.assignedAccountManager.user.lastName}`
          : null
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 