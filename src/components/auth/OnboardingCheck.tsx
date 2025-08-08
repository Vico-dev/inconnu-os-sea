"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface OnboardingCheckProps {
  children: React.ReactNode
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
  const { session, status, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    console.log("OnboardingCheck - Status:", status)
    console.log("OnboardingCheck - Session:", session)
    console.log("OnboardingCheck - User ID:", session?.user?.id)

    if (isAuthenticated && session?.user?.role === "CLIENT") {
      // Vérifier si l&apos;onboarding est terminé via une API
      const checkOnboarding = async () => {
        try {
          const userId = session.user.id
          console.log("OnboardingCheck - Checking onboarding for user:", userId)
          
          const response = await fetch(`/api/onboarding/check?userId=${userId}`)
          console.log("OnboardingCheck - API response status:", response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log("OnboardingCheck - API data:", data)
            
            if (!data.onboardingCompleted) {
              console.log("OnboardingCheck - Redirecting to onboarding")
              router.push("/onboarding")
            } else if (data.subscription?.status === "TRIAL" && !data.hasActiveSubscription) {
              // Rediriger vers la souscription si l&apos;essai est terminé ou pas d&apos;abonnement actif
              console.log("OnboardingCheck - Redirecting to subscription")
              router.push("/subscription")
            } else {
              console.log("OnboardingCheck - Onboarding and subscription completed, staying on dashboard")
            }
          } else {
            console.error("Erreur lors de la vérification de l&apos;onboarding:", response.status)
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l&apos;onboarding:", error)
        }
      }

      checkOnboarding()
    }
  }, [session, status, isAuthenticated, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 