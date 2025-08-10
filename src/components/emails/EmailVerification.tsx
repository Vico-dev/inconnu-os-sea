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

interface EmailVerificationProps {
  firstName: string
  verificationUrl: string
}

export default function EmailVerification({ firstName, verificationUrl }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Validez votre compte Agence Inconnu</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logo}>Agence Inconnu</Text>
          
          <Text style={heading}>Validez votre compte</Text>
          
          <Text style={paragraph}>
            Bonjour {firstName},
          </Text>

          <Text style={paragraph}>
            Merci de vous être inscrit chez Agence Inconnu ! Pour activer votre compte et accéder à nos services, veuillez cliquer sur le bouton ci-dessous.
          </Text>

          <Text style={paragraph}>
            Cette validation est nécessaire pour sécuriser votre compte et vous permettre d'accéder à votre espace client.
          </Text>

          <Button style={button} href={verificationUrl}>
            Valider mon compte
          </Button>

          <Text style={smallText}>
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br />
            <Link href={verificationUrl} style={link}>{verificationUrl}</Link>
          </Text>

          <Text style={paragraph}>
            Ce lien expirera dans 24 heures pour des raisons de sécurité.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
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

const smallText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#6b7280',
  marginBottom: '16px',
}

const link = {
  color: '#1d4ed8',
  textDecoration: 'underline',
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