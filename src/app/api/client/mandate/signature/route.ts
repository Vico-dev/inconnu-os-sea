import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { EmailService } from '@/lib/email-service'

function generateSignatureCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Début demande de code de signature')
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('✅ Session utilisateur trouvée:', session.user.email)

    const mandate = await prisma.advertisingMandate.findFirst({
      where: {
        clientAccount: {
          userId: session.user.id
        }
      },
      include: {
        clientAccount: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!mandate) {
      console.log('❌ Aucun mandat trouvé pour l\'utilisateur:', session.user.id)
      return NextResponse.json({ error: 'Aucun mandat trouvé' }, { status: 404 })
    }

    console.log('✅ Mandat trouvé:', mandate.mandateNumber)

    if (mandate.signatureVerified) {
      console.log('❌ Mandat déjà signé')
      return NextResponse.json({ error: 'Le mandat est déjà signé' }, { status: 400 })
    }

    const signatureCode = generateSignatureCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    console.log('🔐 Code généré:', signatureCode, 'Expire:', expiresAt)

    await prisma.advertisingMandate.update({
      where: { id: mandate.id },
      data: {
        signatureCode,
        signatureExpiresAt: expiresAt,
        signatureVerified: false
      }
    })

    console.log('✅ Code sauvegardé en base')

    console.log('📧 Envoi email à:', mandate.clientAccount.user.email)
    await EmailService.sendSignatureCode(
      mandate.clientAccount.user.email,
      mandate.clientAccount.user.firstName,
      mandate.mandateNumber,
      signatureCode,
      expiresAt.toISOString()
    )

    console.log('✅ Email envoyé avec succès')

    return NextResponse.json({ 
      message: 'Code de signature envoyé par email',
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur lors de la demande de code de signature:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi du code de signature' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { signatureCode } = await request.json()

    if (!signatureCode) {
      return NextResponse.json({ error: 'Code de signature requis' }, { status: 400 })
    }

    const mandate = await prisma.advertisingMandate.findFirst({
      where: {
        clientAccount: {
          userId: session.user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!mandate) {
      return NextResponse.json({ error: 'Aucun mandat trouvé' }, { status: 404 })
    }

    if (!mandate.signatureCode || mandate.signatureCode !== signatureCode) {
      return NextResponse.json({ error: 'Code de signature invalide' }, { status: 400 })
    }

    if (!mandate.signatureExpiresAt || new Date() > mandate.signatureExpiresAt) {
      return NextResponse.json({ error: 'Code de signature expiré' }, { status: 400 })
    }

    await prisma.advertisingMandate.update({
      where: { id: mandate.id },
      data: {
        signatureVerified: true,
        signedAt: new Date(),
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({ 
      message: 'Signature électronique validée avec succès',
      mandateNumber: mandate.mandateNumber
    })

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du code:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification du code' 
    }, { status: 500 })
  }
} 