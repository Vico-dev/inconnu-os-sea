"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AMLayout } from "@/components/am/AMLayout"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Send,
  AlertCircle,
  CheckCircle
} from "lucide-react"

export default function AMCreateTicketPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    category: "other",
    clientEmail: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdByAM: true,
          amId: user?.accountManager?.id
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/am/tickets')
        }, 2000)
      } else {
        console.error("Erreur lors de la création du ticket")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <AMLayout>
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket créé avec succès !</h2>
              <p className="text-gray-600 mb-4">Le ticket a été créé et sera visible dans votre liste.</p>
              <Button onClick={() => router.push('/am/tickets')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux tickets
              </Button>
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
              onClick={() => router.push('/am/tickets')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux tickets
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau ticket</h1>
            <p className="text-gray-600">Créez un ticket pour un client</p>
          </div>

          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Nouveau ticket
                </CardTitle>
                <CardDescription>
                  Remplissez les informations pour créer un ticket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="clientEmail">Email du client *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="client@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L&apos;email du client pour lequel vous créez ce ticket
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      placeholder="Sujet du ticket"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le problème ou la demande..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Créer le ticket
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/am/tickets')}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </AMLayout>
    </ProtectedRoute>
  )
} 