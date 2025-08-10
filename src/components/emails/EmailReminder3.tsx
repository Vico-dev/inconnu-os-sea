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

interface EmailReminder3Props {
  firstName: string
  companyName: string
  loginUrl: string
  unsubscribeUrl: string
}

export const EmailReminder3: React.FC<EmailReminder3Props> = ({
  firstName,
  companyName,
  loginUrl,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {firstName}, ne manquez pas ces opportunités ! ⏰
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
              Il y a maintenant une semaine que vous avez créé votre compte Agence Inconnu. Nous nous inquiétons de ne pas avoir de vos nouvelles.
            </Text>

            <Text style={text}>
              <strong>Saviez-vous que chaque jour sans optimisation Google Ads peut vous coûter :</strong>
            </Text>

            <Section style={statsSection}>
              <Text style={statItem}>💰 <strong>500€ à 2000€</strong> de budget publicitaire gaspillé</Text>
              <Text style={statItem}>🎯 <strong>20 à 50 conversions</strong> manquées</Text>
              <Text style={statItem}>📈 <strong>15 à 30% de ROI</strong> en moins</Text>
              <Text style={statItem}>⏰ <strong>2 à 4 heures</strong> de temps perdu en gestion manuelle</Text>
            </Section>

            <Text style={text}>
              Vos concurrents, eux, optimisent leurs campagnes en ce moment même. Ne les laissez pas prendre l&apos;avantage !
            </Text>

            <Section style={urgencySection}>
              <Text style={urgencyText}>
                <strong>🚨 Dernière chance :</strong> Votre espace client est prêt et vous attend. 
                En seulement 10 minutes, vous pourrez commencer à optimiser vos campagnes.
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Link href={loginUrl} style={ctaButton}>
                Optimiser mes campagnes maintenant
              </Link>
            </Section>

            <Text style={text}>
              Si vous rencontrez des difficultés ou avez des questions, notre équipe est disponible pour vous accompagner gratuitement.
            </Text>

            <Text style={text}>
              À très bientôt,<br />
              L&apos;équipe Agence Inconnu
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

const statsSection = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  border: '1px solid #f59e0b',
}

const statItem = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  fontWeight: '500',
}

const urgencySection = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  border: '1px solid #ef4444',
}

const urgencyText = {
  color: '#991b1b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontWeight: '500',
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

export default EmailReminder3 