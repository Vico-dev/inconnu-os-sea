import resend from './resend'
import WelcomeEmail from '@/components/emails/WelcomeEmail'
import PaymentConfirmationEmail from '@/components/emails/PaymentConfirmationEmail'
import { render } from '@react-email/components'

export class EmailService {
  private static from = 'Agence Inconnu <noreply@agence-inconnu.fr>'

  /**
   * Envoyer un email de bienvenue
   */
  static async sendWelcomeEmail(
    to: string,
    firstName: string,
    companyName: string,
    plan: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de bienvenue ignoré')
        return null
      }

      const emailHtml = render(
        WelcomeEmail({
          firstName,
          companyName,
          plan
        })
      )

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Bienvenue chez Agence Inconnu ! 🎉',
        html: emailHtml,
      })

      console.log('Email de bienvenue envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de bienvenue:', error)
      throw error
    }
  }

  /**
   * Envoyer une confirmation de paiement
   */
  static async sendPaymentConfirmation(
    to: string,
    firstName: string,
    companyName: string,
    plan: string,
    amount: string,
    invoiceUrl?: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de confirmation de paiement ignoré')
        return null
      }

      const emailHtml = render(
        PaymentConfirmationEmail({
          firstName,
          companyName,
          plan,
          amount,
          invoiceUrl
        })
      )

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Paiement confirmé - Agence Inconnu ✅',
        html: emailHtml,
      })

      console.log('Email de confirmation de paiement envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de confirmation de paiement:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de notification de ticket
   */
  static async sendTicketNotification(
    to: string,
    firstName: string,
    ticketId: string,
    subject: string,
    message: string,
    isNewTicket: boolean = false
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de notification de ticket ignoré')
        return null
      }

      const emailSubject = isNewTicket 
        ? `Nouveau ticket créé - #${ticketId}`
        : `Réponse à votre ticket - #${ticketId}`

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">${emailSubject}</h3>
          <p>Bonjour ${firstName},</p>
          <p>${message}</p>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>Détails du ticket :</strong><br>
            ID: #${ticketId}<br>
            Sujet: ${subject}
          </div>
          <a href="${process.env.NEXTAUTH_URL}/client/tickets/${ticketId}" 
             style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Voir le ticket
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads
          </p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: emailSubject,
        html: emailHtml,
      })

      console.log('Email de notification de ticket envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de notification de ticket:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de rappel de facturation
   */
  static async sendBillingReminder(
    to: string,
    firstName: string,
    companyName: string,
    plan: string,
    amount: string,
    dueDate: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de rappel de facturation ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #dc2626;">Rappel de facturation</h3>
          <p>Bonjour ${firstName},</p>
          <p>Votre prochaine facturation approche.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <strong>Détails de la facturation :</strong><br>
            Entreprise: ${companyName}<br>
            Forfait: ${plan}<br>
            Montant: ${amount}<br>
            Date d'échéance: ${dueDate}
          </div>
          <a href="${process.env.NEXTAUTH_URL}/client" 
             style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Gérer mon abonnement
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Pour toute question, contactez-nous à billing@agence-inconnu.fr
          </p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Rappel de facturation - Agence Inconnu',
        html: emailHtml,
      })

      console.log('Email de rappel de facturation envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de rappel de facturation:', error)
      throw error
    }
  }
} 