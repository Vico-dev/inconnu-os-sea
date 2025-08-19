export class PDFService {
  static async generateMandatePDF(data: any): Promise<Buffer> {
    // Version simplifiée pour Railway (sans Puppeteer)
    // Génère un PDF basique en HTML que le navigateur peut télécharger
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Mandat ${data.mandateNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1d4ed8; margin-bottom: 10px; }
          .title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
          .important { background-color: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; }
          .footer { margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Agence Inconnu</div>
          <div class="title">Mandat Publicitaire</div>
        </div>

        <div class="section">
          <div class="section-title">Informations du mandat</div>
          <table>
            <tr><td><strong>Numéro :</strong></td><td>${data.mandateNumber}</td></tr>
            <tr><td><strong>Client :</strong></td><td>${data.clientName}</td></tr>
            <tr><td><strong>Date de signature :</strong></td><td>${new Date(data.signedAt).toLocaleDateString('fr-FR')}</td></tr>
            <tr><td><strong>Validité :</strong></td><td>Du ${new Date(data.validFrom).toLocaleDateString('fr-FR')} au ${new Date(data.validUntil).toLocaleDateString('fr-FR')}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Budget média</div>
          <table>
            <tr><td><strong>Type :</strong></td><td>${data.budgetType === 'FIXED' ? 'Budget annuel fixe' : 'Budget mensuel variable'}</td></tr>
            <tr><td><strong>Montant :</strong></td><td>${data.totalAnnualBudget.toLocaleString('fr-FR')} €</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Objet du mandat</div>
          <p>Le présent mandat autorise l'Agence Inconnu à gérer les campagnes publicitaires Google Ads du client pour une durée d'un an.</p>
          
          <div class="important">
            <strong>⚠️ Important :</strong><br>
            • Le mandat est valable pour une durée d'un an<br>
            • Le renouvellement annuel est obligatoire<br>
            • Un rappel sera envoyé 30 jours avant l'expiration
          </div>
        </div>

        <div class="footer">
          <p>Agence Inconnu - Spécialiste Google Ads</p>
          <p>Document généré électroniquement - Version v1.0</p>
        </div>
      </body>
      </html>
    `
    
    // Retourner le HTML comme PDF (le navigateur s'en chargera)
    return Buffer.from(html, 'utf-8')
  }
} 