"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = []
}: ProtectedRouteProps) {
  const { status, user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    // Si pas authentifié, rediriger vers login
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Si des rôles sont spécifiés et que l&apos;utilisateur n&apos;a pas le bon rôle
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Rediriger vers la page appropriée selon le rôle
      if (user.role === "ADMIN") {
        router.push("/admin")
      } else if (user.role === "ACCOUNT_MANAGER") {
        router.push("/am")
      } else if (user.role === "CLIENT") {
        router.push("/client")
      } else {
        router.push("/login")
      }
      return
    }
  }, [status, isAuthenticated, user, allowedRoles, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    )
  }

  // Si pas authentifié ou mauvais rôle, ne rien afficher
  if (!isAuthenticated || (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
} 