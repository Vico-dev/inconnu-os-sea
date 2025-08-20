"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { BarChart3 } from "lucide-react"

export default function AMAnalyticsPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Analysez vos performances et celles de vos clients</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Performance</CardTitle>
              <CardDescription>
                Graphiques et statistiques de vos activités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune donnée disponible</p>
                <p className="text-sm">Les analytics apparaîtront ici une fois que vous aurez de l&apos;activité</p>
              </div>
            </CardContent>
          </Card>
        </div>
    </ProtectedRoute>
  )
} 