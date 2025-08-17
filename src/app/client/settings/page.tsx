"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ClientSettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences de compte et de notifications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres du compte</CardTitle>
            <CardDescription>Cette section sera enrichie prochainement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">Aucun paramètre disponible pour le moment.</div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

