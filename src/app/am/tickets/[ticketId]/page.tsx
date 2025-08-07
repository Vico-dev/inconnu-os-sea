"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Send, 
  User, 
  Shield, 
  MessageSquare, 
  Calendar, 
  Clock,
  Edit,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface TicketResponse {
  id: string
  content: string
  isFromAM: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  client: {
    name: string
    email: string
    company: string
  }
}

export default function AMTicketDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const ticketId = params.ticketId as string

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/responses`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
        setResponses(data.responses)
      } else {
        console.error("Erreur lors de la récupération du ticket")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitResponse = async () => {
    if (!newResponse.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newResponse,
          amId: user?.accountManager?.id
        }),
      })

      if (response.ok) {
        setNewResponse("")
        await fetchTicketDetails()
      } else {
        console.error("Erreur lors de l'envoi de la réponse")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchTicketDetails()
      } else {
        console.error("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "bg-blue-100 text-blue-800"
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800"
      case "RESOLVED": return "bg-green-100 text-green-800"
      case "CLOSED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "high": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN": return "Ouvert"
      case "IN_PROGRESS": return "En cours"
      case "RESOLVED": return "Résolu"
      case "CLOSED": return "Fermé"
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low": return "Faible"
      case "medium": return "Moyenne"
      case "high": return "Élevée"
      default: return priority
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du ticket...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!ticket) {
    return (
      <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket non trouvé</h2>
            <p className="text-gray-600 mb-4">Le ticket que vous recherchez n&apos;existe pas.</p>
            <Button onClick={() => router.push('/am/tickets')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tickets
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/am/tickets')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux tickets
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
          <p className="text-gray-600">Gestion du ticket #{ticket.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Détails du ticket */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations du ticket */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Détails du ticket</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {ticket.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Client</h4>
                    <p className="text-sm">{ticket.client.name}</p>
                    <p className="text-xs text-gray-500">{ticket.client.email}</p>
                    <p className="text-xs text-gray-500">{ticket.client.company}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Créé le</h4>
                    <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Changement de statut */}
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Changer le statut</h4>
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Ouvert</SelectItem>
                      <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                      <SelectItem value="RESOLVED">Résolu</SelectItem>
                      <SelectItem value="CLOSED">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Réponses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Réponses ({responses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune réponse pour le moment</p>
                  ) : (
                    responses.map((response) => (
                      <div
                        key={response.id}
                        className={`p-4 rounded-lg border ${
                          response.isFromAM ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              response.isFromAM ? 'bg-blue-600' : 'bg-gray-600'
                            }`}>
                              <span className="text-white text-xs">
                                {response.user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{response.user.name}</p>
                              <p className="text-xs text-gray-500">
                                {response.isFromAM ? 'Account Manager' : 'Client'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{response.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nouvelle réponse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2" />
                  Ajouter une réponse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tapez votre réponse..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!newResponse.trim() || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer la réponse
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-xs text-gray-500">{ticket.client.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Entreprise</p>
                    <p className="text-xs text-gray-500">{ticket.client.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Créé le</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Dernière mise à jour</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.updatedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`mailto:${ticket.client.email}?subject=Re: ${ticket.subject}`)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Contacter le client
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/am/tickets')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la liste
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 