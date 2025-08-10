import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface EmailReminder1Props {
  firstName: string
  companyName: string
  loginUrl: string
  unsubscribeUrl: string
}

export const EmailReminder1: React.FC<EmailReminder1Props> = ({
  firstName,
  companyName,
  loginUrl,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {firstName}, votre compte Agence Inconnu vous attend ! 🚀
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
              Nous avons remarqué que vous avez créé votre compte chez Agence Inconnu mais que vous n'avez pas encore finalisé votre inscription.
            </Text>

            <Text style={text}>
              Votre espace client est prêt et vous attend ! En quelques minutes, vous pourrez :
            </Text>

            <Section style={benefitsList}>
              <Text style={benefitItem}>✅ Accéder à vos rapports Google Ads en temps réel</Text>
              <Text style={benefitItem}>✅ Optimiser vos campagnes avec nos recommandations</Text>
              <Text style={benefitItem}>✅ Suivre vos performances et ROI</Text>
              <Text style={benefitItem}>✅ Bénéficier de notre expertise SEA</Text>
            </Section>

            <Text style={text}>
              <strong>Ne laissez pas vos concurrents prendre l'avantage !</strong> Chaque jour sans optimisation peut vous coûter des opportunités de conversion.
            </Text>

            <Section style={ctaSection}>
              <Link href={loginUrl} style={ctaButton}>
                Finaliser mon inscription
              </Link>
            </Section>

            <Text style={text}>
              Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter. Notre équipe est là pour vous accompagner.
            </Text>

            <Text style={text}>
              À très bientôt,<br />
              L'équipe Agence Inconnu
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Cet email a été envoyé à {firstName} de {companyName}.<br />
              <Link href={unsubscribeUrl} style={footerLink}>
                Se désabonner
              </Link>
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

const benefitsList = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
}

const benefitItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
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

const footerLink = {
  color: '#6b7280',
  textDecoration: 'underline',
}

export default EmailReminder1 