"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { FeedManager } from "@/components/admin/FeedManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  ArrowLeft,
  Users,
  CheckCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

interface GoogleAdsAccount {
  id: string
  name: string
  customerId: string
  status: string
  clientName?: string
  clientEmail?: string
}

export default function FeedManagerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accountId = localStorage.getItem("selectedGoogleAdsAccount")
    if (!accountId) {
      router.push("/admin/campaign-operator")
      return
    }

    // Récupérer les informations du compte depuis l'API
    fetchAccountInfo(accountId)
  }, [router])

  const fetchAccountInfo = async (accountId: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/list-clients")
      const data = await response.json()
      
      if (data.success) {
        const client = data.clients.find((c: any) => c.clientAccountId === accountId)
        if (client) {
          setSelectedAccount({
            id: client.clientAccountId,
            name: `${client.companyName || client.userName} - Google Ads`,
            customerId: `customer_${client.clientAccountId}`,
            status: "ACTIVE",
            clientName: client.userName,
            clientEmail: client.userEmail
          })
        }
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/admin/campaign-operator")
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <span>Chargement...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!selectedAccount) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <span>Aucun compte sélectionné</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <Target className="w-8 h-8 text-purple-600" />
                <span>Feed Manager</span>
              </h1>
              <p className="text-muted-foreground">
                Gérer les flux produits Google Merchant Center
              </p>
            </div>
          </div>
        </div>

        {/* Compte sélectionné */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Compte sélectionné</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">{selectedAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  Client: {selectedAccount.clientName} ({selectedAccount.clientEmail})
                </p>
              </div>
              <Badge variant="default">{selectedAccount.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Feed Manager Component */}
        <FeedManager selectedAccount={selectedAccount} />
      </div>
    </ProtectedRoute>
  )
} 