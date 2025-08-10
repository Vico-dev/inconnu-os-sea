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

interface EmailReminder2Props {
  firstName: string
  companyName: string
  loginUrl: string
  unsubscribeUrl: string
}

export const EmailReminder2: React.FC<EmailReminder2Props> = ({
  firstName,
  companyName,
  loginUrl,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {firstName}, découvrez ce que nos clients disent de nous ! 💬
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
              Il y a 3 jours, vous avez créé votre compte Agence Inconnu. Nous espérons que tout va bien !
            </Text>

            <Text style={text}>
              Nous voulions partager avec vous quelques témoignages de nos clients qui ont transformé leurs campagnes Google Ads :
            </Text>

            <Section style={testimonialSection}>
              <Section style={testimonial}>
                <Text style={testimonialText}>
                  &quot;Grâce à Agence Inconnu, notre ROI a augmenté de 40% en seulement 2 mois. L&apos;équipe est réactive et professionnelle.&quot;
                </Text>
                <Text style={testimonialAuthor}>
                  — Marie Dubois, Directrice Marketing, TechStart
                </Text>
              </Section>

              <Section style={testimonial}>
                <Text style={testimonialText}>
                  &quot;Nous avons économisé 15 000€ sur nos dépenses publicitaires tout en augmentant nos conversions. Un vrai game-changer !&quot;
                </Text>
                <Text style={testimonialAuthor}>
                  — Thomas Martin, CEO, E-commerce Pro
                </Text>
              </Section>

              <Section style={testimonial}>
                <Text style={testimonialText}>
                  &quot;L&apos;optimisation automatique et les rapports détaillés nous font gagner un temps fou. Je recommande vivement !&quot;
                </Text>
                <Text style={testimonialAuthor}>
                  — Sophie Bernard, Responsable Marketing, Retail Plus
                </Text>
              </Section>
            </Section>

            <Text style={text}>
              <strong>Ces résultats sont à votre portée !</strong> Votre espace client est prêt et vous attend pour commencer votre transformation.
            </Text>

            <Section style={ctaSection}>
              <Link href={loginUrl} style={ctaButton}>
                Rejoindre nos clients satisfaits
              </Link>
            </Section>

            <Text style={text}>
              Si vous avez des questions sur nos services ou besoin d&apos;une démonstration personnalisée, notre équipe est disponible pour vous accompagner.
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

const testimonialSection = {
  margin: '24px 0',
}

const testimonial = {
  margin: '16px 0',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  borderLeft: '4px solid #2563eb',
}

const testimonialText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  fontStyle: 'italic',
}

const testimonialAuthor = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  fontWeight: 'bold',
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

export default EmailReminder2 