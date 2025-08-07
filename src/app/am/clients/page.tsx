"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AMLayout } from "@/components/am/AMLayout"
import { Users } from "lucide-react"

export default function AMClientsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <AMLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes Clients</h1>
            <p className="text-gray-600">Gérez vos clients assignés</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clients Assignés</CardTitle>
              <CardDescription>
                Liste de vos clients assignés par l&apos;administrateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun client assigné</p>
                <p className="text-sm">Les clients vous seront assignés par l&apos;administrateur</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AMLayout>
    </ProtectedRoute>
  )
} 