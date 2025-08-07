"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AMLayout } from "@/components/am/AMLayout"
import { Settings } from "lucide-react"

export default function AMSettingsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <AMLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Configurez vos préférences</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Compte</CardTitle>
              <CardDescription>
                Gérez vos préférences et informations de profil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Paramètres en cours de développement</p>
                <p className="text-sm">Cette section sera bientôt disponible</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AMLayout>
    </ProtectedRoute>
  )
} 