export class PDFService {
  static async generateMandatePDF(data: any): Promise<Buffer> {
    // Formater les budgets mensuels
    const formatMonthlyBudgets = (monthlyBudgets: any[]) => {
      if (!monthlyBudgets || !Array.isArray(monthlyBudgets)) return ''
      
      return monthlyBudgets.map((budget: any) => {
        const monthName = budget.monthName || `Mois ${budget.month}`
        const amount = budget.amount?.toLocaleString('fr-FR') || '0'
        return `<tr><td>${monthName}</td><td style="text-align: right;">${amount} €</td></tr>`
      }).join('')
    }

    // Conditions de paiement selon le type de gestion
    const getPaymentConditions = () => {
      if (data.treasuryManagement) {
        return `
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669;">
            <h4 style="color: #059669; margin: 0 0 10px 0;">Gestion de Trésorerie par l'Agence</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>L'agence avance les dépenses publicitaires</li>
              <li>Frais de gestion : 20% des dépenses (minimum 50€/mois)</li>
              <li>Paiement : 30 jours fin de mois</li>
              <li>Facturation mensuelle : dépenses + frais de gestion</li>
            </ul>
          </div>
        `
      } else {
        return `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #d97706;">
            <h4 style="color: #d97706; margin: 0 0 10px 0;">Paiement Direct par le Client</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Le client paie directement les dépenses publicitaires</li>
              <li>Frais d'agence selon devis en vigueur</li>
              <li>Paiement des frais d'agence : 30 jours fin de mois</li>
              <li><strong>⚠️ Important :</strong> Un retard de paiement peut entraîner une suspension des services</li>
            </ul>
          </div>
        `
      }
    }
    
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Mandat ${data.mandateNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #1f2937;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #1d4ed8; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1d4ed8; 
            margin-bottom: 10px; 
          }
          .title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 5px; 
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #1f2937; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
          }
          th, td { 
            padding: 8px; 
            border-bottom: 1px solid #f3f4f6; 
            text-align: left;
          }
          th { 
            background-color: #f9fafb; 
            font-weight: bold;
          }
          .important { 
            background-color: #fef3c7; 
            border-left: 4px solid #d97706; 
            padding: 15px; 
            margin: 20px 0; 
          }
          .footer { 
            margin-top: 40px; 
            font-size: 12px; 
            color: #6b7280; 
            text-align: center; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px; 
          }
          .budget-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin: 15px 0;
          }
          .budget-item {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .budget-month {
            font-weight: bold;
            color: #1d4ed8;
          }
          .budget-amount {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
          }
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
          <div class="section-title">Budget média annuel</div>
          <table>
            <tr><td><strong>Type :</strong></td><td>${data.budgetType === 'FIXED' ? 'Budget annuel fixe' : 'Budget mensuel variable'}</td></tr>
            <tr><td><strong>Montant total :</strong></td><td><strong>${data.totalAnnualBudget?.toLocaleString('fr-FR')} €</strong></td></tr>
          </table>
        </div>

        ${data.monthlyBudgets && data.monthlyBudgets.length > 0 ? `
        <div class="section">
          <div class="section-title">Échéancier mensuel</div>
          <div class="budget-grid">
            ${data.monthlyBudgets.map((budget: any) => `
              <div class="budget-item">
                <div class="budget-month">${budget.monthName || `Mois ${budget.month}`}</div>
                <div class="budget-amount">${budget.amount?.toLocaleString('fr-FR') || '0'} €</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Conditions de paiement</div>
          ${getPaymentConditions()}
        </div>

        <div class="section">
          <div class="section-title">Objet du mandat</div>
          <p>Le présent mandat autorise l'Agence Inconnu à gérer les campagnes publicitaires Google Ads du client pour une durée d'un an.</p>
          
          <div class="important">
            <strong>⚠️ Important :</strong><br>
            • Le mandat est valable pour une durée d'un an<br>
            • Le renouvellement annuel est obligatoire<br>
            • Un rappel sera envoyé 30 jours avant l'expiration<br>
            • En cas de retard de paiement, les services peuvent être suspendus
          </div>
        </div>

        <div class="footer">
          <p>Agence Inconnu - Spécialiste Google Ads</p>
          <p>Document généré électroniquement - Version v1.0</p>
          <p>Signature électronique validée le ${new Date(data.signedAt).toLocaleString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `
    
    return Buffer.from(html, 'utf-8')
  }
} 