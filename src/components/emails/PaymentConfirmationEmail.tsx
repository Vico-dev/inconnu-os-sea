import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Link,
  Preview,
  Hr,
  Button,
} from '@react-email/components'

interface PaymentConfirmationEmailProps {
  firstName: string
  companyName: string
  plan: string
  amount: string
  invoiceUrl?: string
}

export default function PaymentConfirmationEmail({ 
  firstName, 
  companyName, 
  plan, 
  amount,
  invoiceUrl 
}: PaymentConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmation de paiement - Agence Inconnu</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Agence Inconnu</Text>
          
          <Text style={heading}>Paiement confirmé ! ✅</Text>
          
          <Text style={paragraph}>
            Bonjour {firstName},
          </Text>

          <Text style={paragraph}>
            Nous avons bien reçu votre paiement. Votre abonnement est maintenant actif !
          </Text>

          <div style={detailsContainer}>
            <Text style={detailLabel}>Entreprise :</Text>
            <Text style={detailValue}>{companyName}</Text>
            
            <Text style={detailLabel}>Forfait :</Text>
            <Text style={detailValue}>{plan}</Text>
            
            <Text style={detailLabel}>Montant :</Text>
            <Text style={detailValue}>{amount}</Text>
          </div>

          <Text style={paragraph}>
            Votre équipe Agence Inconnu va maintenant prendre en charge l'optimisation de vos campagnes Google Ads.
          </Text>

          <Button style={button} href={`${process.env.NEXTAUTH_URL}/client`}>
            Accéder à votre espace client
          </Button>

          {invoiceUrl && (
            <Button style={secondaryButton} href={invoiceUrl}>
              Télécharger la facture
            </Button>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Pour toute question concernant votre facturation, contactez-nous à{' '}
            <Link href="mailto:billing@agence-inconnu.fr" style={link}>
              billing@agence-inconnu.fr
            </Link>
          </Text>

          <Text style={footer}>
            Agence Inconnu - Spécialiste Google Ads
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const logo = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'center' as const,
  marginBottom: '30px',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#059669',
  marginBottom: '20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  marginBottom: '16px',
}

const detailsContainer = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#6b7280',
  marginBottom: '4px',
}

const detailValue = {
  fontSize: '16px',
  color: '#1f2937',
  marginBottom: '16px',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  marginBottom: '12px',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#1d4ed8',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  marginBottom: '24px',
  border: '2px solid #1d4ed8',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const footer = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const link = {
  color: '#1d4ed8',
  textDecoration: 'underline',
} 