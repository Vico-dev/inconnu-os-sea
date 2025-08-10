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

interface WelcomeEmailProps {
  firstName: string
  companyName: string
  plan: string
}

export default function WelcomeEmail({ firstName, companyName, plan }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue chez Agence Inconnu - Votre partenaire SEA</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Agence Inconnu</Text>
          
          <Text style={heading}>Bienvenue {firstName} ! 🎉</Text>
          
          <Text style={paragraph}>
            Nous sommes ravis de vous accueillir chez Agence Inconnu, votre partenaire de confiance pour optimiser votre présence Google Ads.
          </Text>

          <Text style={paragraph}>
            <strong>Votre entreprise :</strong> {companyName}<br />
            <strong>Votre forfait :</strong> {plan}
          </Text>

          <Text style={paragraph}>
            Voici ce qui vous attend :
          </Text>

          <ul style={list}>
            <li style={listItem}>✅ Gestion complète de vos campagnes Google Ads</li>
            <li style={listItem}>📊 Reporting détaillé et optimisations en temps réel</li>
            <li style={listItem}>🎯 Stratégies personnalisées pour maximiser votre ROI</li>
            <li style={listItem}>💬 Support dédié et accompagnement personnalisé</li>
          </ul>

          <Button style={button} href={`${process.env.NEXTAUTH_URL}/client`}>
            Accéder à votre espace client
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous avez des questions, n'hésitez pas à nous contacter à{' '}
            <Link href="mailto:contact@agence-inconnu.fr" style={link}>
              contact@agence-inconnu.fr
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
  color: '#1f2937',
  marginBottom: '20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  marginBottom: '16px',
}

const list = {
  marginBottom: '24px',
  paddingLeft: '20px',
}

const listItem = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  marginBottom: '8px',
}

const button = {
  backgroundColor: '#1d4ed8',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  marginBottom: '24px',
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