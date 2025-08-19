import puppeteer from 'puppeteer'

export class PDFService {
  static async generateMandatePDF(data: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    const html = `
      <html>
        <head><title>Mandat ${data.mandateNumber}</title></head>
        <body>
          <h1>Mandat Publicitaire - ${data.mandateNumber}</h1>
          <p>Client: ${data.clientName}</p>
          <p>Budget: ${data.totalAnnualBudget}€</p>
          <p>Signé le: ${new Date(data.signedAt).toLocaleDateString('fr-FR')}</p>
        </body>
      </html>
    `
    
    await page.setContent(html)
    const pdf = await page.pdf({ format: 'A4' })
    await browser.close()
    
    return Buffer.from(pdf)
  }
} 