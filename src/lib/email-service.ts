import resend from './resend'

export class EmailService {
  private static from = 'Agence Inconnu <noreply@agence-inconnu.fr>'

  /**
   * Envoyer un email de validation de compte
   */
  static async sendEmailVerification(
    to: string,
    firstName: string,
    verificationUrl: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de validation ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Validez votre compte</h3>
          <p>Bonjour ${firstName},</p>
          <p>Cliquez sur le lien ci-dessous pour valider votre compte :</p>
          <a href="${verificationUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Valider mon compte
          </a>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: 'Validez votre compte - Agence Inconnu',
        html: emailHtml,
      })

      console.log('Email de validation envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de validation:', error)
      throw error
    }
  }

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

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Bienvenue ! 🎉</h3>
          <p>Bonjour ${firstName},</p>
          <p>Bienvenue chez ${companyName} ! Votre plan ${plan} est maintenant actif.</p>
        </div>
      `

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

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #16a34a;">Paiement confirmé ✅</h3>
          <p>Bonjour ${firstName},</p>
          <p>Votre paiement de ${amount} pour ${companyName} (plan ${plan}) a été confirmé.</p>
          ${invoiceUrl ? `<a href="${invoiceUrl}">Télécharger la facture</a>` : ''}
        </div>
      `

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

  /**
   * Envoyer le premier email de relance (jour 1)
   */
  static async sendReminder1(
    to: string,
    firstName: string,
    companyName: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de relance 1 ignoré')
        return null
      }

      const loginUrl = `${process.env.NEXTAUTH_URL}/login`
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(to)}`

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Votre compte vous attend ! 🚀</h3>
          <p>Bonjour ${firstName},</p>
          <p>Vous avez créé un compte pour ${companyName}. Connectez-vous pour commencer !</p>
          <a href="${loginUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Se connecter
          </a>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${firstName}, votre compte Agence Inconnu vous attend ! 🚀`,
        html: emailHtml,
      })

      console.log('Email de relance 1 envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de relance 1:', error)
      throw error
    }
  }

  /**
   * Envoyer le deuxième email de relance (jour 3)
   */
  static async sendReminder2(
    to: string,
    firstName: string,
    companyName: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de relance 2 ignoré')
        return null
      }

      const loginUrl = `${process.env.NEXTAUTH_URL}/login`
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(to)}`

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Découvrez nos témoignages ! 💬</h3>
          <p>Bonjour ${firstName},</p>
          <p>Nos clients parlent de nous ! Découvrez leurs témoignages.</p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${firstName}, découvrez ce que nos clients disent de nous ! 💬`,
        html: emailHtml,
      })

      console.log('Email de relance 2 envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de relance 2:', error)
      throw error
    }
  }

  /**
   * Envoyer le troisième email de relance (jour 7)
   */
  static async sendReminder3(
    to: string,
    firstName: string,
    companyName: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de relance 3 ignoré')
        return null
      }

      const loginUrl = `${process.env.NEXTAUTH_URL}/login`
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(to)}`

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Ne manquez pas ces opportunités ! ⏰</h3>
          <p>Bonjour ${firstName},</p>
          <p>Votre compte ${companyName} vous attend toujours.</p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${firstName}, ne manquez pas ces opportunités ! ⏰`,
        html: emailHtml,
      })

      console.log('Email de relance 3 envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de relance 3:', error)
      throw error
    }
  }

  /**
   * Envoyer le quatrième email de relance (jour 14)
   */
  static async sendReminder4(
    to: string,
    firstName: string,
    companyName: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de relance 4 ignoré')
        return null
      }

      const loginUrl = `${process.env.NEXTAUTH_URL}/login`
      const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(to)}`

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Dernière chance !</h3>
          <p>Bonjour ${firstName},</p>
          <p>Votre dernière chance de transformer vos campagnes Google Ads pour ${companyName}.</p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${firstName}, votre dernière chance de transformer vos campagnes Google Ads`,
        html: emailHtml,
      })

      console.log('Email de relance 4 envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de relance 4:', error)
      throw error
    }
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  static async sendPasswordReset(
    to: string,
    firstName: string,
    resetUrl: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de réinitialisation ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">Réinitialisation du mot de passe</h3>
          <p>Bonjour ${firstName},</p>
          <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
          <a href="${resetUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${firstName}, réinitialisez votre mot de passe - Agence Inconnu`,
        html: emailHtml,
      })

      console.log('Email de réinitialisation envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de réinitialisation:', error)
      throw error
    }
  }
} 