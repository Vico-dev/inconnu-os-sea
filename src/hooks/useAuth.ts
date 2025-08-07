"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const redirectBasedOnRole = () => {
    if (session?.user?.role === "ADMIN" || session?.user?.role === "ACCOUNT_MANAGER") {
      router.push("/admin")
    } else if (session?.user?.role === "CLIENT") {
      // Vérifier si l'onboarding est terminé
      if (session?.user?.clientAccount?.onboardingCompleted) {
        router.push("/client")
      } else {
        router.push("/onboarding")
      }
    }
  }

  return {
    session,
    status,
    login,
    logout,
    redirectBasedOnRole,
    isAuthenticated: !!session,
    user: session?.user,
    role: session?.user?.role
  }
} 