"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, User, Shield, MessageSquare, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

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
  accountManager: {
    id: string
    name: string
    email: string
  } | null
  client: {
    name: string
    email: string
    company: string
  }
}

export default function TicketDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [newResponse, setNewResponse] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ticketId = params?.ticketId as string

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
          userId: user?.id
        }),
      })

      if (response.ok) {
        setNewResponse("")
        await fetchTicketDetails() // Recharger les données
      } else {
        console.error("Erreur lors de l&apos;envoi de la réponse")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "technical": return "Technique"
      case "billing": return "Facturation"
      case "general": return "Général"
      default: return category
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["CLIENT"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <ProtectedRoute allowedRoles={["CLIENT"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Ticket non trouvé</p>
            <Button onClick={() => router.push("/client")} className="mt-4">
              Retour au dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/client")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Détails du ticket</h1>
                <p className="text-sm text-gray-600">#{ticket.id.slice(-8)}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Ticket Info */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-2">
                      {ticket.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {getPriorityLabel(ticket.priority)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {getCategoryLabel(ticket.category)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      {ticket.accountManager ? ticket.accountManager.name : "Non assigné"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responses */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Historique des échanges</CardTitle>
                <CardDescription>
                  {responses.length} réponse{responses.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune réponse pour le moment
                    </div>
                  ) : (
                    responses.map((response, index) => (
                      <div
                        key={response.id}
                        className={`flex ${response.isFromAM ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-lg ${
                            response.isFromAM
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {response.isFromAM ? (
                              <Shield className="w-4 h-4 text-blue-600" />
                            ) : (
                              <User className="w-4 h-4 text-gray-600" />
                            )}
                            <span className="text-sm font-medium">
                              {response.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {response.isFromAM ? '(AM)' : '(Vous)'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{response.content}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(response.createdAt).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* New Response Form */}
            <Card>
              <CardHeader>
                <CardTitle>Ajouter une réponse</CardTitle>
                <CardDescription>
                  Répondez à votre ticket ou posez une question supplémentaire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={!newResponse.trim() || isSubmitting}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Envoi..." : "Envoyer la réponse"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 