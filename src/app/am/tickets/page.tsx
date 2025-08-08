"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AMLayout } from "@/components/am/AMLayout"
import { useRouter } from "next/navigation"
import { 
  MessageSquare, 
  Filter,
  Search,
  ArrowLeft
} from "lucide-react"

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  createdAt: string
  client: {
    name: string
    email: string
    company: string
  }
  responsesCount: number
}

export default function AMTicketsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user?.role === "ACCOUNT_MANAGER") {
      fetchTickets()
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/tickets/am?amId=${user?.accountManager?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tickets:", error)
    } finally {
      setIsLoading(false)
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

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === "all" || ticket.status === filterStatus
    const priorityMatch = filterPriority === "all" || ticket.priority === filterPriority
    const searchMatch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ticket.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ticket.client.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    return statusMatch && priorityMatch && searchMatch
  })

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <AMLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des tickets...</p>
            </div>
          </div>
        </AMLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <AMLayout>
        <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/am')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-600">Gérez tous vos tickets assignés</p>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="OPEN">Ouvert</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="RESOLVED">Résolu</SelectItem>
                    <SelectItem value="CLOSED">Fermé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priorité</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value="high">Élevée</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="low">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterPriority("all")
                    setSearchTerm("")
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des tickets */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center justify-between">
                  <span>Mes Tickets ({filteredTickets.length})</span>
                  <Badge variant="secondary" className="ml-2">
                    {tickets.length} total
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Cliquez sur un ticket pour voir les détails et répondre
                </CardDescription>
              </div>
              <Button onClick={() => router.push('/am/tickets/create')}>
                <send className="w-4 h-4 mr-2" />
                Créer un ticket
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucun ticket trouvé</p>
                  <p className="text-sm">Aucun ticket ne correspond à vos critères de recherche</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/am/tickets/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Client: {ticket.client.name}</span>
                          <span>Entreprise: {ticket.client.company}</span>
                          <span>Réponses: {ticket.responsesCount}</span>
                          <span>Créé le: {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-600">Cliquer pour répondre</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AMLayout>
  </ProtectedRoute>
)
} 