"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Target, 
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  Loader2
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

export default function CampaignOperatorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/list-clients")
      const data = await response.json()
      
      if (data.success) {
        // Créer des comptes Google Ads pour les clients
        const mockAccounts: GoogleAdsAccount[] = data.clients.map((client: any) => ({
          id: client.clientAccountId,
          name: `${client.companyName || client.userName} - Google Ads`,
          customerId: `customer_${client.clientAccountId}`,
          status: "ACTIVE",
          clientName: client.userName,
          clientEmail: client.userEmail
        }))
        setAccounts(mockAccounts)
      }
    } catch (error) {
      setError("Erreur lors du chargement des comptes")
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId)
    // Stocker le compte sélectionné dans localStorage pour les sous-onglets
    localStorage.setItem("selectedGoogleAdsAccount", accountId)
  }

  const navigateToSubPage = (subPage: string) => {
    if (!selectedAccount) {
      alert("Veuillez sélectionner un compte Google Ads")
      return
    }
    router.push(`/admin/campaign-operator/${subPage}`)
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Chargement des comptes...</span>
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
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Target className="w-8 h-8 text-primary" />
              <span>Campaign Operator</span>
            </h1>
            <p className="text-muted-foreground">
              Sélectionnez un compte Google Ads pour accéder aux outils de gestion de campagnes
            </p>
          </div>
        </div>

        {/* Sélection du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Sélection du compte Google Ads</span>
            </CardTitle>
            <CardDescription>
              Choisissez le compte client pour lequel vous souhaitez gérer les campagnes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Compte Google Ads</label>
              <Select value={selectedAccount} onValueChange={handleAccountSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un compte client" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <span>{account.name}</span>
                        <Badge variant={account.status === "ACTIVE" ? "default" : "secondary"}>
                          {account.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAccount && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Compte sélectionné</span>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  {accounts.find(a => a.id === selectedAccount)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outils disponibles */}
        {selectedAccount && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateToSubPage("creator")}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Campaign Creator</span>
                </CardTitle>
                <CardDescription>
                  Créer des campagnes Google Ads performantes avec l'assistance IA
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateToSubPage("optimizer")}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Campaign Optimizer</span>
                </CardTitle>
                <CardDescription>
                  Optimiser les campagnes existantes et analyser les performances
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigateToSubPage("feed-manager")}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Feed Manager</span>
                </CardTitle>
                <CardDescription>
                  Gérer les flux produits Google Merchant Center
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}