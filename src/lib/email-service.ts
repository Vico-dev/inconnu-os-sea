import resend from './resend'

export class EmailService {
  private static from = process.env.RESEND_FROM || 'Agence Inconnu <onboarding@resend.dev>'

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
        console.log('⚠️ Resend non configuré - Email de validation ignoré')
        // En mode développement, on peut valider automatiquement
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Mode développement - Validation automatique activée')
          return { success: true, mode: 'development' }
        }
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

      console.log('✅ Email de validation envoyé:', result)
      return result
    } catch (error) {
      console.error('❌ Erreur envoi email de validation:', error)
      // En mode développement, on peut continuer sans email
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Mode développement - Validation automatique activée')
        return { success: true, mode: 'development' }
      }
      throw error
    }
  }

  /**
   * Envoyer un email de bienvenue pour les nouveaux utilisateurs
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
   * Envoyer un email de bienvenue pour les nouveaux utilisateurs créés par l'admin
   */
  static async sendNewUserWelcomeEmail(params: {
    to: string
    name: string
    role: string
    companyName?: string
    onboardingUrl: string
    type: 'client_welcome' | 'am_welcome'
  }) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de bienvenue nouveau utilisateur ignoré')
        return null
      }

      const { to, name, role, companyName, onboardingUrl, type } = params

      let subject = ''
      let emailHtml = ''

      if (type === 'client_welcome') {
        subject = `Bienvenue chez Agence Inconnu - ${companyName}`
        emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Agence Inconnu</h2>
            <h3 style="color: #1d4ed8;">Bienvenue ! 🎉</h3>
            <p>Bonjour ${name},</p>
            <p>Votre compte client pour ${companyName} a été créé avec succès.</p>
            <p>Pour commencer à utiliser notre plateforme, veuillez compléter votre onboarding :</p>
            <a href="${onboardingUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Commencer l'onboarding
            </a>
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              Si vous avez des questions, n'hésitez pas à contacter votre Account Manager.
            </p>
          </div>
        `
             } else if (type === 'am_welcome') {
         subject = 'Bienvenue dans l\'équipe Agence Inconnu'
         emailHtml = `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #1f2937;">Agence Inconnu</h2>
             <h3 style="color: #1d4ed8;">Bienvenue dans l'équipe ! 🎉</h3>
             <p>Bonjour ${name},</p>
             <p>Votre compte Account Manager a été créé avec succès.</p>
             <p>Pour configurer votre profil et commencer à travailler, veuillez compléter votre onboarding :</p>
             <a href="${onboardingUrl}" style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
               Configurer mon profil
             </a>
             <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
               Vous pourrez ensuite configurer votre lien de prise de rendez-vous (Calendly/Gmail) et commencer à gérer vos clients.
             </p>
             <p style="margin-top: 10px; font-size: 14px; color: #6b7280;">
               <strong>Important :</strong> N'oubliez pas de configurer vos liens de prise de rendez-vous pour permettre aux clients de vous contacter facilement.
             </p>
           </div>
         `
       }

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject,
        html: emailHtml,
      })

      console.log('Email de bienvenue nouveau utilisateur envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de bienvenue nouveau utilisateur:', error)
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

  /**
   * Envoyer un email de confirmation de mandat publicitaire
   */
  static async sendMandateConfirmation(
    to: string,
    firstName: string,
    mandateNumber: string,
    signedAt: string,
    budgetInfo: string,
    mandateUrl: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de confirmation de mandat ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #059669;">Confirmation de votre mandat publicitaire</h3>
          <p>Bonjour ${firstName},</p>
          <p>Nous confirmons la signature de votre mandat publicitaire avec les informations suivantes :</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <strong>Détails du mandat :</strong><br>
            Numéro de mandat: <strong>${mandateNumber}</strong><br>
            Date de signature: ${new Date(signedAt).toLocaleDateString('fr-FR')}<br>
            Budget média: ${budgetInfo}
          </div>
          
          <p>Ce mandat est valable pour une durée d'un an et autorise l'Agence Inconnu à gérer vos campagnes publicitaires en ligne.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
            <strong>⚠️ Important :</strong><br>
            • Vous recevrez un rappel 30 jours avant l'expiration<br>
            • Le renouvellement annuel est obligatoire pour maintenir les services<br>
            • Conservez cet email comme preuve de votre consentement
          </div>
          
          <a href="${mandateUrl}" 
             style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Voir mon mandat
          </a>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads<br>
            Ce mandat a été signé électroniquement et est juridiquement valide
          </p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `Confirmation de mandat publicitaire - ${mandateNumber}`,
        html: emailHtml,
      })

      console.log('Email de confirmation de mandat envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de confirmation de mandat:', error)
      throw error
    }
  }

  /**
   * Envoyer une notification admin/AM pour nouveau mandat
   */
  static async sendMandateNotificationToAdmin(
    adminEmail: string,
    clientName: string,
    companyName: string,
    mandateNumber: string,
    budgetInfo: string,
    adminUrl: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de notification admin ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu - Notification Admin</h2>
          <h3 style="color: #1d4ed8;">Nouveau mandat publicitaire signé</h3>
          
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1d4ed8;">
            <strong>Nouveau mandat :</strong><br>
            Client: <strong>${clientName}</strong><br>
            Entreprise: ${companyName}<br>
            Numéro de mandat: <strong>${mandateNumber}</strong><br>
            Budget média: ${budgetInfo}
          </div>
          
          <p>Le client a signé son mandat publicitaire et peut maintenant accéder aux services de publicité en ligne.</p>
          
          <a href="${adminUrl}" 
             style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Voir le mandat
          </a>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Système de notification automatique
          </p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [adminEmail],
        subject: `Nouveau mandat signé - ${clientName} (${mandateNumber})`,
        html: emailHtml,
      })

      console.log('Email de notification admin envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de notification admin:', error)
      throw error
    }
  }

  /**
   * Envoyer un rappel d'expiration de mandat
   */
  static async sendMandateExpirationReminder(
    to: string,
    firstName: string,
    mandateNumber: string,
    expirationDate: string,
    renewalUrl: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de rappel d\'expiration ignoré')
        return null
      }
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #dc2626;">⚠️ Votre mandat publicitaire expire bientôt</h3>
          <p>Bonjour ${firstName},</p>
          <p>Votre mandat publicitaire <strong>${mandateNumber}</strong> expire le <strong>${new Date(expirationDate).toLocaleDateString('fr-FR')}</strong>.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <strong>Action requise :</strong><br>
            Pour maintenir vos services de publicité, vous devez renouveler votre mandat avant l'expiration.
          </div>
          
          <a href="${renewalUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Renouveler mon mandat
          </a>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads<br>
            Ce rappel automatique a été envoyé 30 jours avant l'expiration
          </p>
        </div>
      `
      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `⚠️ Expiration mandat publicitaire - ${mandateNumber}`,
        html: emailHtml,
      })
      console.log('Email de rappel d\'expiration envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de rappel d\'expiration:', error)
      throw error
    }
  }

  static async sendSignatureCode(
    to: string,
    firstName: string,
    mandateNumber: string,
    signatureCode: string,
    expiresAt: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de code de signature ignoré')
        return null
      }
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #059669;">Code de signature électronique</h3>
          <p>Bonjour ${firstName},</p>
          <p>Vous avez demandé à signer électroniquement votre mandat publicitaire <strong>${mandateNumber}</strong>.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <strong>Votre code de signature :</strong><br>
            <div style="font-size: 32px; font-weight: bold; color: #059669; text-align: center; padding: 20px; background-color: white; border-radius: 8px; margin: 10px 0; letter-spacing: 8px;">
              ${signatureCode}
            </div>
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Ce code expire le ${new Date(expiresAt).toLocaleString('fr-FR')}
            </p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
            <strong>⚠️ Sécurité :</strong><br>
            • Ce code est valable 15 minutes uniquement<br>
            • Ne partagez jamais ce code avec quiconque<br>
            • Si vous n'avez pas demandé cette signature, ignorez cet email
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads<br>
            Signature électronique sécurisée - Code à usage unique
          </p>
        </div>
      `
      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `Code de signature - Mandat ${mandateNumber}`,
        html: emailHtml,
      })
      console.log('Email de code de signature envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de code de signature:', error)
      throw error
    }
  }

  /**
   * Envoyer une notification par email
   */
  static async sendNotificationEmail(
    to: string,
    firstName: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de notification ignoré')
        return null
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Agence Inconnu</h2>
          <h3 style="color: #1d4ed8;">${title}</h3>
          <p>Bonjour ${firstName},</p>
          <p>${message}</p>
          ${actionUrl ? `
            <a href="${actionUrl}" 
               style="background-color: #1d4ed8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Voir les détails
            </a>
          ` : ''}
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Agence Inconnu - Spécialiste Google Ads
          </p>
        </div>
      `

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `${title} - Agence Inconnu`,
        html: emailHtml,
      })

      console.log('Email de notification envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de notification:', error)
      throw error
    }
  }

  /**
   * Envoyer un rapport hebdomadaire
   */
  static async sendWeeklyReport(
    to: string,
    firstName: string,
    companyName: string,
    reportHtml: string
  ) {
    try {
      if (!resend) {
        console.log('Resend non configuré, email de rapport ignoré')
        return null
      }

      const result = await resend.emails.send({
        from: this.from,
        to: [to],
        subject: `Rapport hebdomadaire - ${companyName}`,
        html: reportHtml,
      })

      console.log('Email de rapport hebdomadaire envoyé:', result)
      return result
    } catch (error) {
      console.error('Erreur envoi email de rapport:', error)
      throw error
    }
  }
} 