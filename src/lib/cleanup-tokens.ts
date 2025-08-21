import { prisma } from "@/lib/db"

export async function cleanupExpiredTokens() {
  try {
    console.log('🧹 Début du nettoyage des tokens expirés...')

    // Nettoyer les tokens de vérification d'email expirés
    const emailResult = await prisma.user.updateMany({
      where: {
        emailVerificationExpires: {
          lt: new Date()
        }
      },
      data: {
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    console.log(`✅ ${emailResult.count} tokens de vérification d'email nettoyés`)

    // Nettoyer les tokens de réinitialisation expirés
    const resetResult = await prisma.user.updateMany({
      where: {
        passwordResetExpires: {
          lt: new Date()
        }
      },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    console.log(`✅ ${resetResult.count} tokens de réinitialisation nettoyés`)

    console.log('🎉 Nettoyage des tokens expirés terminé')
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des tokens:', error)
  }
}

// Fonction pour exécuter le nettoyage manuellement
export async function runCleanup() {
  await cleanupExpiredTokens()
  process.exit(0)
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runCleanup()
} 