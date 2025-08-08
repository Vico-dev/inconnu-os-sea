import { z } from "zod"

// Schémas de base
export const emailSchema = z.string().email("Email invalide")
export const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")

// Schéma d&apos;authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis")
})

export const registerSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").max(50, "Prénom trop long"),
  lastName: z.string().min(2, "Nom trop court").max(50, "Nom trop long"),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

// Schéma d&apos;onboarding
export const onboardingSchema = z.object({
  companyName: z.string().min(2, "Nom d&apos;entreprise trop court").max(100, "Nom d&apos;entreprise trop long"),
  industry: z.string().min(2, "Secteur d&apos;activité requis"),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(10, "Adresse trop courte"),
  city: z.string().min(2, "Ville trop courte"),
  postalCode: z.string().min(5, "Code postal invalide"),
  country: z.string().min(2, "Pays requis"),
  dailyBudget: z.string().min(1, "Budget journalier requis"),
  description: z.string().min(10, "Description trop courte").max(500, "Description trop longue")
})

// Schéma de création de ticket
export const createTicketSchema = z.object({
  subject: z.string().min(5, "Sujet trop court").max(100, "Sujet trop long"),
  description: z.string().min(10, "Description trop courte").max(1000, "Description trop longue"),
  category: z.enum(["technical", "billing", "general"], {
    errorMap: () => ({ message: "Catégorie invalide" })
  }),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priorité invalide" })
  })
})

// Schéma de réponse à un ticket
export const ticketResponseSchema = z.object({
  content: z.string().min(1, "Contenu requis").max(2000, "Contenu trop long"),
  userId: z.string().min(1, "ID utilisateur requis"),
  amId: z.string().optional()
})

// Schéma de création d&apos;utilisateur (Admin)
export const createUserSchema = z.object({
  firstName: z.string().min(2, "Prénom trop court").max(50, "Prénom trop long"),
  lastName: z.string().min(2, "Nom trop court").max(50, "Nom trop long"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "ACCOUNT_MANAGER", "CLIENT"], {
    errorMap: () => ({ message: "Rôle invalide" })
  }),
  phone: z.string().min(10, "Numéro de téléphone invalide").optional(),
  companyName: z.string().min(2, "Nom d&apos;entreprise trop court").optional()
})

// Schéma de changement de plan
export const changePlanSchema = z.object({
  plan: z.enum(["starter", "pro", "enterprise"], {
    errorMap: () => ({ message: "Plan invalide" })
  })
})

// Schéma de demande de rendez-vous
export const appointmentSchema = z.object({
  type: z.enum(["call", "meeting", "consultation"], {
    errorMap: () => ({ message: "Type de rendez-vous invalide" })
  }),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  duration: z.number().min(15, "Durée minimale 15 minutes").max(120, "Durée maximale 2 heures"),
  subject: z.string().min(5, "Sujet trop court").max(100, "Sujet trop long"),
  description: z.string().min(10, "Description trop courte").max(500, "Description trop longue")
})

// Schéma de paramètres d&apos;URL
export const ticketIdSchema = z.object({
  ticketId: z.string().min(1, "ID du ticket requis")
})

// Fonction utilitaire pour valider les données
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Données invalides" }
    }
    return { success: false, error: "Erreur de validation" }
  }
} 