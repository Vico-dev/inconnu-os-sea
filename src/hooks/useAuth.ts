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
    console.log("redirectBasedOnRole - User role:", session?.user?.role)
    console.log("redirectBasedOnRole - User:", session?.user)
    
    if (session?.user?.role === "ADMIN" || session?.user?.role === "ACCOUNT_MANAGER") {
      console.log("redirectBasedOnRole - Redirecting ADMIN/AM to /admin")
      router.push("/admin")
    } else if (session?.user?.role === "CLIENT") {
      // Vérifier si l&apos;onboarding est terminé
      if (session?.user?.clientAccount?.onboardingCompleted) {
        console.log("redirectBasedOnRole - Redirecting CLIENT to /client (onboarding completed)")
        router.push("/client")
      } else {
        console.log("redirectBasedOnRole - Redirecting CLIENT to /onboarding (onboarding not completed)")
        router.push("/onboarding")
      }
    } else {
      console.log("redirectBasedOnRole - Unknown role, redirecting to /")
      router.push("/")
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