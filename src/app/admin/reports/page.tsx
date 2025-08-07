"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { 
  BarChart3, 
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Calendar
} from "lucide-react"

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des rapports...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rapports & Analytics</h1>
            <p className="text-gray-600">Analysez les performances de la plateforme</p>
          </div>

          <div className="space-y-6">
            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Croissance Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">+12%</div>
                  <p className="text-sm text-gray-600">Ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                    Revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">€12,450</div>
                  <p className="text-sm text-gray-600">Ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                    Tickets Résolus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">85%</div>
                  <p className="text-sm text-gray-600">Taux de résolution</p>
                </CardContent>
              </Card>
            </div>

            {/* Rapports détaillés */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                  <CardDescription>
                    Dernières actions sur la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Nouveau client inscrit</p>
                          <p className="text-sm text-gray-600">Il y a 2 heures</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Client</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Ticket résolu</p>
                          <p className="text-sm text-gray-600">Il y a 4 heures</p>
                        </div>
                      </div>
                      <Badge variant="outline">Résolu</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">Paiement reçu</p>
                          <p className="text-sm text-gray-600">Il y a 1 jour</p>
                        </div>
                      </div>
                      <Badge variant="default">€199</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Google Ads</CardTitle>
                  <CardDescription>
                    Statistiques des campagnes connectées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Comptes connectés</span>
                      <Badge variant="secondary">3/6</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Campagnes actives</span>
                      <Badge variant="secondary">12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Budget total</span>
                      <Badge variant="default">€2,450</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">ROAS moyen</span>
                      <Badge variant="outline">3.2x</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Placeholder pour graphiques */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Revenus</CardTitle>
                <CardDescription>
                  Graphique des revenus mensuels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Graphique des revenus</p>
                    <p className="text-sm">Intégration Chart.js à venir</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 