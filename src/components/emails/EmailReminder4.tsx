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

interface EmailReminder4Props {
  firstName: string
  companyName: string
  loginUrl: string
  unsubscribeUrl: string
}

export const EmailReminder4: React.FC<EmailReminder4Props> = ({
  firstName,
  companyName,
  loginUrl,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {firstName}, votre dernière chance de transformer vos campagnes Google Ads
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
              Il y a maintenant 2 semaines que vous avez créé votre compte Agence Inconnu. 
              Nous devons malheureusement vous informer que votre accès va expirer dans 24 heures.
            </Text>

            <Text style={text}>
              <strong>Impact sur votre business :</strong>
            </Text>

            <Section style={impactSection}>
              <Text style={impactItem}>📉 <strong>Perte de 10 000€ à 40 000€</strong> de budget publicitaire non optimisé</Text>
              <Text style={impactItem}>🎯 <strong>200 à 500 conversions</strong> manquées</Text>
              <Text style={impactItem}>📊 <strong>30 à 50% de ROI</strong> en moins sur vos campagnes</Text>
              <Text style={impactItem}>⏰ <strong>40 à 80 heures</strong> de temps perdu en gestion manuelle</Text>
              <Text style={impactItem}>🏆 <strong>Avantage concurrentiel</strong> perdu face à vos concurrents</Text>
            </Section>

            <Text style={text}>
              Nos clients actifs voient en moyenne une amélioration de <strong>35% de leur ROI</strong> dès le premier mois.
            </Text>

            <Section style={finalSection}>
              <Text style={finalText}>
                <strong>🚨 DERNIÈRE OPPORTUNITÉ :</strong><br />
                Votre espace client est prêt et vous attend. 
                En seulement 5 minutes, vous pourrez commencer à optimiser vos campagnes et voir des résultats dès la première semaine.
              </Text>
            </Section>

            <Section style={ctaSection}>
              <Link href={loginUrl} style={ctaButton}>
                Activer mon compte maintenant
              </Link>
            </Section>

            <Text style={text}>
              Si vous ne souhaitez pas continuer, nous comprendrons. Votre compte sera automatiquement supprimé dans 24 heures.
            </Text>

            <Text style={text}>
              Merci de nous avoir donné l&apos;opportunité de vous accompagner.<br />
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

const impactSection = {
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #dc2626',
}

const impactItem = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  fontWeight: '500',
}

const finalSection = {
  margin: '24px 0',
  padding: '20px',
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  border: '2px solid #dc2626',
}

const finalText = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontWeight: '500',
  textAlign: 'center' as const,
}

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const ctaButton = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
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

export default EmailReminder4 