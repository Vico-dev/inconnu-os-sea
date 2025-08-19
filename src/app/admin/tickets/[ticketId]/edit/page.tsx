"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save,
  AlertCircle
} from "lucide-react"

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  category: string
  client: {
    name: string
    email: string
    company: string
  }
}

export default function AdminTicketEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "",
    priority: "",
    category: ""
  })

  const ticketId = params?.ticketId as string

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/details`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
        setFormData({
          subject: data.ticket.subject,
          description: data.ticket.description,
          status: data.ticket.status,
          priority: data.ticket.priority,
          category: data.ticket.category
        })
      } else {
        console.error("Erreur lors de la récupération du ticket")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/admin/tickets/${ticketId}`)
      } else {
        console.error("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement du ticket...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  if (!ticket) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="p-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket non trouvé</h2>
              <p className="text-gray-600 mb-4">Le ticket que vous recherchez n&apos;existe pas.</p>
              <Button onClick={() => router.push('/admin/tickets')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux tickets
              </Button>
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
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/tickets/${ticketId}`)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux détails
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Modifier le ticket</h1>
            <p className="text-gray-600">Modifiez les informations du ticket #{ticket.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire d'édition */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du ticket</CardTitle>
                  <CardDescription>
                    Modifiez les détails du ticket
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={6}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({...formData, status: value})}
                      >
                        <SelectTrigger>
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

                    <div>
                      <Label htmlFor="priority">Priorité</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({...formData, priority: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Faible</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Élevée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technique</SelectItem>
                        <SelectItem value="billing">Facturation</SelectItem>
                        <SelectItem value="optimization">Optimisation</SelectItem>
                        <SelectItem value="account">Compte</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informations client */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations client</CardTitle>
                  <CardDescription>
                    Informations du client (non modifiables)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nom du client</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {ticket.client.name}
                    </p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {ticket.client.email}
                    </p>
                  </div>
                  <div>
                    <Label>Entreprise</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {ticket.client.company}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder les modifications
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/tickets/${ticketId}`)}
                    className="w-full"
                  >
                    Annuler
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 