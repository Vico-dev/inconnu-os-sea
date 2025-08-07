import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const permissions = await prisma.googleAdsPermission.findMany({
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
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      permissions: permissions.map(permission => ({
        ...permission,
        permissions: JSON.parse(permission.permissions)
      }))
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { clientAccountId, googleAdsCustomerId, permissions } = body

    // Vérifier que le compte client existe
    const clientAccount = await prisma.clientAccount.findUnique({
      where: { id: clientAccountId },
      include: {
        user: true
      }
    })

    if (!clientAccount) {
      return NextResponse.json(
        { error: 'Compte client non trouvé' },
        { status: 404 }
      )
    }

    // Créer ou mettre à jour la permission
    const permission = await prisma.googleAdsPermission.upsert({
      where: {
        clientAccountId_googleAdsCustomerId: {
          clientAccountId,
          googleAdsCustomerId
        }
      },
      update: {
        permissions: JSON.stringify(permissions),
        isActive: true
      },
      create: {
        clientAccountId,
        userId: clientAccount.userId,
        googleAdsCustomerId,
        permissions: JSON.stringify(permissions),
        isActive: true
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
      }
    })

    return NextResponse.json({
      permission: {
        ...permission,
        permissions: JSON.parse(permission.permissions)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création de la permission:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { permissionId, isActive } = body

    const permission = await prisma.googleAdsPermission.update({
      where: { id: permissionId },
      data: { isActive },
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
      }
    })

    return NextResponse.json({
      permission: {
        ...permission,
        permissions: JSON.parse(permission.permissions)
      }
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la permission:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
} 