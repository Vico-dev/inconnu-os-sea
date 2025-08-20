import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Construire la requête
    const where: any = {
      OR: [
        { userId: session.user.id },
        { clientAccount: { userId: session.user.id } }
      ]
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        clientAccount: {
          include: {
            company: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: await prisma.notification.count({
        where: {
          ...where,
          read: false
        }
      })
    })

  } catch (error: any) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des notifications' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { notificationId, action } = await request.json()

    if (!notificationId || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    switch (action) {
      case 'markAsRead':
        await prisma.notification.update({
          where: { 
            id: notificationId,
            OR: [
              { userId: session.user.id },
              { clientAccount: { userId: session.user.id } }
            ]
          },
          data: { 
            read: true, 
            readAt: new Date() 
          }
        })
        break

      case 'markAllAsRead':
        await prisma.notification.updateMany({
          where: {
            OR: [
              { userId: session.user.id },
              { clientAccount: { userId: session.user.id } }
            ],
            read: false
          },
          data: { 
            read: true, 
            readAt: new Date() 
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Erreur mise à jour notification:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la mise à jour de la notification' 
    }, { status: 500 })
  }
} 