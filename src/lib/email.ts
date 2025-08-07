import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailData) {
  try {
    if (!resend) {
      console.log('Resend non configuré, email simulé:', { to, subject })
      return { success: true, data: { id: 'simulated' } }
    }

    const { data, error } = await resend.emails.send({
      from: 'Agence Inconnu <noreply@agence-inconnu.fr>',
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      return { success: false, error }
    }

    console.log('Email envoyé avec succès:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

export function generateWelcomeEmail(userName: string, loginUrl: string) {
  return {
    subject: 'Bienvenue chez Agence Inconnu !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bienvenue chez Agence Inconnu !</h1>
        <p>Bonjour ${userName},</p>
        <p>Nous sommes ravis de vous accueillir sur notre plateforme de gestion SEA.</p>
        <p>Votre compte a été créé avec succès. Vous pouvez dès maintenant :</p>
        <ul>
          <li>Compléter votre profil entreprise</li>
          <li>Connecter votre compte Google Ads</li>
          <li>Accéder à vos rapports de campagne</li>
          <li>Gérer vos factures et abonnements</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accéder à votre espace client
          </a>
        </div>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br>L'équipe Agence Inconnu</p>
      </div>
    `
  }
}

export function generateCancellationEmail(userName: string, endDate: string) {
  return {
    subject: 'Confirmation de résiliation - Agence Inconnu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Résiliation confirmée</h1>
        <p>Bonjour ${userName},</p>
        <p>Nous confirmons la résiliation de votre abonnement.</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">Important</h3>
          <p><strong>Mois engagé, mois dû :</strong> Votre abonnement reste actif jusqu'au ${endDate}.</p>
          <p>Vous continuerez à bénéficier de tous nos services jusqu'à cette date.</p>
        </div>
        <p>Nous espérons vous revoir bientôt !</p>
        <p>Cordialement,<br>L'équipe Agence Inconnu</p>
      </div>
    `
  }
}

export function generateSubscriptionEmail(userName: string, planName: string, amount: number) {
  return {
    subject: 'Abonnement activé - Agence Inconnu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Abonnement activé</h1>
        <p>Bonjour ${userName},</p>
        <p>Votre abonnement ${planName} a été activé avec succès !</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #059669; margin-top: 0;">Détails de votre abonnement</h3>
          <p><strong>Plan :</strong> ${planName}</p>
          <p><strong>Montant :</strong> ${amount}€/mois</p>
          <p><strong>Statut :</strong> Actif</p>
        </div>
        <p>Vous pouvez dès maintenant accéder à toutes les fonctionnalités de votre plan.</p>
        <p>Cordialement,<br>L'équipe Agence Inconnu</p>
      </div>
    `
  }
} 