import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PasswordResetEmailProps {
  firstName: string
  resetUrl: string
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  firstName,
  resetUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {firstName}, réinitialisez votre mot de passe - Agence Inconnu
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>Agence Inconnu</Heading>
            <Text style={subtitle}>Votre partenaire Google Ads</Text>
          </Section>

          <Section style={content}>
            <Heading style={h2}>Bonjour {firstName},</Heading>
            
            <Text style={text}>
              Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Agence Inconnu.
            </Text>

            <Text style={text}>
              Si vous n&apos;avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </Text>

            <Section style={ctaSection}>
              <Link href={resetUrl} style={ctaButton}>
                Réinitialiser mon mot de passe
              </Link>
            </Section>

            <Text style={text}>
              Ce lien de réinitialisation expire dans <strong>1 heure</strong> pour des raisons de sécurité.
            </Text>

            <Text style={text}>
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </Text>

            <Text style={linkText}>
              {resetUrl}
            </Text>

            <Text style={text}>
              Si vous avez des questions ou besoin d&apos;aide, n&apos;hésitez pas à nous contacter.
            </Text>

            <Text style={text}>
              Cordialement,<br />
              L&apos;équipe Agence Inconnu
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Cet email a été envoyé suite à une demande de réinitialisation de mot de passe.<br />
              Si vous n&apos;êtes pas à l&apos;origine de cette demande, veuillez ignorer cet email.
            </Text>
          </Section>
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

const header = {
  textAlign: 'center' as const,
  marginBottom: '40px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const subtitle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}

const content = {
  padding: '0 24px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  wordBreak: 'break-all' as const,
}

const footer = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '32px',
  paddingTop: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
}

export default PasswordResetEmail 