"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  FileText
} from "lucide-react"

interface Subscription {
  id: string
  status: string
  amount: number
  plan: string
  startDate: string
  endDate?: string
  clientAccount: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
    company: {
      name: string
    }
  }
}

export default function AdminBillingPage() {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/billing/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "default"
      case "TRIAL": return "secondary"
      case "CANCELLED": return "destructive"
      default: return "outline"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Actif"
      case "TRIAL": return "Essai"
      case "CANCELLED": return "Annulé"
      default: return status
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.clientAccount.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.clientAccount.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.clientAccount.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeSubscriptions = subscriptions.filter(s => s.status === "ACTIVE")
  const pendingSubscriptions = subscriptions.filter(s => s.status === "TRIAL")
  const cancelledSubscriptions = subscriptions.filter(s => s.status === "CANCELLED")
  const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0)

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement de la facturation...</p>
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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestion de la Facturation</h1>
            <p className="text-gray-600">Suivez les paiements et abonnements des clients</p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Abonnements Actifs</p>
                    <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">En Essai</p>
                    <p className="text-2xl font-bold">{pendingSubscriptions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Revenus Mensuels</p>
                    <p className="text-2xl font-bold">€{totalRevenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Annulés</p>
                    <p className="text-2xl font-bold">{cancelledSubscriptions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recherche */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Liste des abonnements */}
          <Card>
            <CardHeader>
              <CardTitle>Tous les Abonnements</CardTitle>
              <CardDescription>
                Gérez les abonnements et suivez les paiements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun abonnement trouvé
                  </div>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {subscription.clientAccount.user.firstName[0]}{subscription.clientAccount.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {subscription.clientAccount.user.firstName} {subscription.clientAccount.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{subscription.clientAccount.user.email}</p>
                            <p className="text-xs text-gray-500">{subscription.clientAccount.company.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={getStatusColor(subscription.status)}>
                              {getStatusLabel(subscription.status)}
                            </Badge>
                            <span className="text-lg font-bold">€{subscription.amount}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Plan: {subscription.plan}
                          </p>
                          <p className="text-xs text-gray-500">
                            Depuis: {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 