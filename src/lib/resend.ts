import { Resend } from 'resend'

// Créer une instance Resend seulement si la clé API est disponible
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export default resend 