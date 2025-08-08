"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { OnboardingCheck } from "@/components/auth/OnboardingCheck"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, FileText, Calendar, MessageSquare, CreditCard, Settings, Zap, CheckCircle } from "lucide-react"

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  createdAt: string
  accountManager?: {
    id: string
    name: string
    email: string
  } | null
}

export default function ClientPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)

  // Charger les tickets
  useEffect(() => {
    if (user?.id) {
      fetchTickets()
    }
  }, [user?.id])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/tickets/client?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error)
    } finally {
      setIsLoadingTickets(false)
    }
  }

  const handleSubscribe = () => {
    router.push("/client/subscribe")
  }

  const handleChangePlan = () => {
    router.push("/client/change-plan")
  }

  const handleManagePayment = () => {
    router.push("/subscription")
  }

  const handleCancelSubscription = () => {
    router.push("/client/cancel-subscription")
  }

  const handleConnectGoogleAds = () => {
    router.push("/client/connect-google-ads")
  }

  const handleCreateTicket = () => {
    router.push("/client/create-ticket")
  }

  const handleRequestAppointment = () => {
    router.push("/client/request-appointment")
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <OnboardingCheck>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Espace Client</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>Déconnexion</Button>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">ROAS</p>
                      <p className="text-2xl font-bold text-gray-900">4.2x</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-green-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Conversions</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-yellow-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="text-2xl font-bold text-gray-900">€2,847</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-purple-600 mr-4" />
                    <div>
                      <p className="text-sm text-gray-600">Factures</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Banner */}
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Souscrivez à un forfait</h3>
                      <p className="text-green-700">
                        Choisissez le forfait qui correspond à votre budget média et commencez à optimiser vos campagnes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-600 text-white">
                      Paiement sécurisé
                    </Badge>
                    <Button onClick={handleSubscribe} size="sm" className="bg-green-600 hover:bg-green-700">
                      Voir les forfaits
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Ads Connection Banner */}
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Connectez votre compte Google Ads</h3>
                      <p className="text-blue-700">
                        Accédez à vos données de campagne en temps réel et bénéficiez d&apos;optimisations automatiques
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Recommandé
                    </Badge>
                    <Button onClick={handleConnectGoogleAds} size="sm">
                      Connecter Google Ads
                    </Button>
                    <Button 
                      onClick={() => router.push('/client/google-ads')} 
                      variant="outline" 
                      size="sm"
                    >
                      Voir le dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
                <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
                <TabsTrigger value="invoices">Factures</TabsTrigger>
                <TabsTrigger value="tickets">Support</TabsTrigger>
                <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
                <TabsTrigger value="subscription">Abonnement</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campagnes Actives</CardTitle>
                      <CardDescription>
                        Vos campagnes Google Ads en cours
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Campagne E-commerce</h4>
                            <p className="text-sm text-gray-600">ROAS: 4.2x | Budget: €1,200</p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Campagne B2B</h4>
                            <p className="text-sm text-gray-600">ROAS: 3.8x | Budget: €800</p>
                          </div>
                          <Badge variant="secondary">Active</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Factures Récentes</CardTitle>
                      <CardDescription>
                        Vos dernières factures
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">FACT-2024-001</h4>
                            <p className="text-sm text-gray-600">Accompagnement mensuel</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">€1,200</p>
                            <Badge className="bg-green-100 text-green-800">Payée</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">FACT-2024-002</h4>
                            <p className="text-sm text-gray-600">Optimisations techniques</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">€800</p>
                            <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <Card>
                  <CardHeader>
                    <CardTitle>Mes Campagnes Google Ads</CardTitle>
                    <CardDescription>
                      Suivi détaillé de vos campagnes publicitaires
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Impressions</p>
                          <p className="text-xl font-bold">45,230</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Clics</p>
                          <p className="text-xl font-bold">1,847</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CTR</p>
                          <p className="text-xl font-bold">4.08%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CPC</p>
                          <p className="text-xl font-bold">€1.23</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card>
                  <CardHeader>
                    <CardTitle>Mes Factures</CardTitle>
                    <CardDescription>
                      Historique et gestion de vos factures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">FACT-2024-001</h4>
                          <p className="text-sm text-gray-600">Accompagnement mensuel - Janvier 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€1,200</p>
                          <Badge className="bg-green-100 text-green-800">Payée</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tickets">
                <Card>
                  <CardHeader>
                    <CardTitle>Support Technique</CardTitle>
                    <CardDescription>
                      Créez et suivez vos tickets de support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full" onClick={handleCreateTicket}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Créer un nouveau ticket
                      </Button>
                      <div className="space-y-2">
                        {isLoadingTickets ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Chargement des tickets...</p>
                          </div>
                        ) : (
                          tickets.map((ticket) => (
                            <div 
                              key={ticket.id} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/client/tickets/${ticket.id}`)}
                            >
                              <div>
                                <h4 className="font-semibold">{ticket.subject}</h4>
                                <p className="text-sm text-gray-600">{ticket.description}</p>
                                {ticket.accountManager && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Assigné à: {ticket.accountManager.name}
                                  </p>
                                )}
                                <p className="text-xs text-blue-600 mt-1">
                                  Cliquer pour voir les détails et réponses
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={
                                  ticket.status === "OPEN" ? "default" :
                                  ticket.status === "IN_PROGRESS" ? "secondary" :
                                  ticket.status === "RESOLVED" ? "outline" :
                                  "destructive"
                                }>
                                  {ticket.status === "OPEN" ? "Ouvert" :
                                   ticket.status === "IN_PROGRESS" ? "En cours" :
                                   ticket.status === "RESOLVED" ? "Résolu" :
                                   "Fermé"}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        {!isLoadingTickets && tickets.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            Aucun ticket pour le moment
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendez-vous</CardTitle>
                    <CardDescription>
                      Planifiez vos rendez-vous avec votre account manager
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full" onClick={handleRequestAppointment}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Demander un rendez-vous
                      </Button>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">Call mensuel</h4>
                            <p className="text-sm text-gray-600">15 janvier 2024 - 14h00</p>
                          </div>
                          <Badge variant="secondary">Confirmé</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion de l&apos;abonnement</CardTitle>
                    <CardDescription>
                      Gérez votre plan d&apos;abonnement et vos informations de paiement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Statut actuel */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-blue-900">Chasseur</h3>
                            <p className="text-blue-700">400€/mois HT - Paiement mensuel sécurisé</p>
                          </div>
                          <Badge className="bg-green-500 text-white">Actif</Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="w-full" onClick={handleChangePlan}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Changer de plan
                        </Button>
                        <Button variant="outline" className="w-full" onClick={handleManagePayment}>
                          <Settings className="w-4 h-4 mr-2" />
                          Gérer le paiement
                        </Button>
                        <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
                          Résilier l&apos;abonnement
                        </Button>
                      </div>

                      {/* Informations */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Informations importantes</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Vous pouvez changer de plan à tout moment</li>
                          <li>• La résiliation prend effet à la fin de la période en cours</li>
                          <li>• Aucun engagement - annulation possible à tout moment</li>
                          <li>• Support disponible 24/7 pour toute question</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </OnboardingCheck>
    </ProtectedRoute>
  )
} 