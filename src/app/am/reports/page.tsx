"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AMLayout } from "@/components/am/AMLayout"
import { FileText } from "lucide-react"

export default function AMReportsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <AMLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
            <p className="text-gray-600">Consultez les rapports de vos clients</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rapports Clients</CardTitle>
              <CardDescription>
                Rapports de performance et d&apos;activité de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun rapport disponible</p>
                <p className="text-sm">Les rapports apparaîtront ici une fois que vous aurez des clients assignés</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AMLayout>
    </ProtectedRoute>
  )
} 