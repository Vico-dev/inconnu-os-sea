"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
// AdminLayout retiré: fourni par app/admin/layout.tsx
import { 
  MessageSquare, 
  Filter,
  Search,
  Clock,
  User,
  Building
} from "lucide-react"

export default function AdminTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/admin/tickets")
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN": return "Ouvert"
      case "IN_PROGRESS": return "En cours"
      case "RESOLVED": return "Résolu"
      case "CLOSED": return "Fermé"
      default: return status
    }
  }

  const filteredTickets = tickets.filter((ticket: any) => {
    const statusMatch = filterStatus === "all" || ticket.status === filterStatus
    const searchMatch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ticket.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return statusMatch && searchMatch
  })

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des tickets...</p>
            </div>
          </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tickets</h1>
          <p className="text-gray-600">Gérez tous les tickets de support</p>
        </div>

          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Tickets</p>
                      <p className="text-2xl font-bold">{tickets.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Non Assignés</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => !t.accountManager).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Assignés</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.accountManager).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">En Cours</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.status === "IN_PROGRESS").length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des tickets */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets à attribuer</CardTitle>
                <CardDescription>
                  Attribuez les tickets aux Account Managers pour un suivi optimal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun ticket à attribuer
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
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
                              <span className="text-xs text-blue-600 ml-auto">Cliquer pour voir les détails</span>
                            </div>
                            <p className="text-gray-600 mb-2">{ticket.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{ticket.clientAccount.user.firstName} {ticket.clientAccount.user.lastName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Shield className="w-4 h-4" />
                                <span>{ticket.clientAccount.company.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {ticket.accountManager ? (
                              <div className="text-right">
                                <p className="text-sm font-medium">Assigné à :</p>
                                <p className="text-sm text-gray-600">
                                  {ticket.accountManager.user.firstName} {ticket.accountManager.user.lastName}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Select
                                  onValueChange={(value) => handleAssignAM(ticket.id, value)}
                                  disabled={isUpdating === ticket.id}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Attribuer à..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {accountManagers.map((am) => (
                                      <SelectItem key={am.id} value={am.id}>
                                        {am.user.firstName} {am.user.lastName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {isUpdating === ticket.id && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
  )
} 