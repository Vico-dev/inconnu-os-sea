import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log('🔍 Debug permissions pour user:', session.user.id)

    // 1. Vérifier le compte client
    const clientAccount = await prisma.clientAccount.findFirst({
      where: { userId: session.user.id },
      include: { user: true }
    })

    console.log('🔍 Client account:', clientAccount)

    // 2. Vérifier les permissions Google Ads
    const permissions = await prisma.googleAdsPermission.findMany({
      where: {
        clientAccountId: clientAccount?.id
      }
    })

    console.log('🔍 Permissions Google Ads:', permissions)

    // 3. Vérifier les connexions admin
    const adminConnections = await prisma.googleAdsConnection.findMany({
      where: {
        isConnected: true
      },
      include: {
        user: true
      }
    })

    console.log('🔍 Connexions admin:', adminConnections)

    return NextResponse.json({
      userId: session.user.id,
      clientAccount,
      permissions,
      adminConnections,
      debug: {
        hasClientAccount: !!clientAccount,
        hasActivePermissions: permissions.filter(p => p.isActive).length,
        hasAdminConnections: adminConnections.length
      }
    })

  } catch (error) {
    console.error('❌ Erreur debug:', error)
    return NextResponse.json({ 
      error: "Erreur debug", 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    }, { status: 500 })
  }
}