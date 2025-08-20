import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔔 Webhook PennyLane reçu:', body.type)

    // Traiter les différents types d'événements PennyLane
    switch (body.type) {
      case 'invoice.created':
        await handleInvoiceCreated(body.data)
        break

      case 'invoice.updated':
        await handleInvoiceUpdated(body.data)
        break

      case 'invoice.paid':
        await handleInvoicePaid(body.data)
        break

      default:
        console.log('Événement PennyLane non géré:', body.type)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Erreur webhook PennyLane:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

async function handleInvoiceCreated(data: any) {
  try {
    console.log('📄 Facture PennyLane créée:', data.id)

    // Mettre à jour l'invoice avec les infos PennyLane
    await prisma.invoice.updateMany({
      where: {
        stripeInvoiceId: data.stripe_invoice_id // Lier via l'ID Stripe
      },
      data: {
        number: data.number,
        invoiceUrl: data.public_url,
        invoicePdfUrl: data.pdf_url,
        items: JSON.stringify(data.items),
        dueDate: new Date(data.due_date)
      }
    })

  } catch (error) {
    console.error('Erreur traitement facture créée:', error)
  }
}

async function handleInvoiceUpdated(data: any) {
  try {
    console.log('🔄 Facture PennyLane mise à jour:', data.id)

    // Mettre à jour l'invoice
    await prisma.invoice.updateMany({
      where: {
        stripeInvoiceId: data.stripe_invoice_id
      },
      data: {
        status: data.status.toUpperCase(),
        amount: data.total_amount,
        invoiceUrl: data.public_url,
        invoicePdfUrl: data.pdf_url
      }
    })

  } catch (error) {
    console.error('Erreur traitement facture mise à jour:', error)
  }
}

async function handleInvoicePaid(data: any) {
  try {
    console.log('✅ Facture PennyLane payée:', data.id)

    // Mettre à jour le statut
    await prisma.invoice.updateMany({
      where: {
        stripeInvoiceId: data.stripe_invoice_id
      },
      data: {
        status: 'PAID',
        paidAt: new Date(data.paid_at)
      }
    })

    // Envoyer email de confirmation avec lien facture
    const invoice = await prisma.invoice.findFirst({
      where: { stripeInvoiceId: data.stripe_invoice_id },
      include: { clientAccount: { include: { user: true, company: true } } }
    })

    if (invoice) {
      try {
        await import('@/lib/email-service').then(({ EmailService }) =>
          EmailService.sendPaymentConfirmation(
            invoice.clientAccount.user.email,
            invoice.clientAccount.user.firstName,
            invoice.clientAccount.company.name,
            'Service Agence Inconnu',
            `${invoice.amount} ${invoice.currency}`,
            data.public_url // Lien vers la facture PennyLane
          )
        )
      } catch (emailError) {
        console.error('Erreur envoi email confirmation:', emailError)
      }
    }

  } catch (error) {
    console.error('Erreur traitement facture payée:', error)
  }
} 