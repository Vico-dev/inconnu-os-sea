"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageSquare, Send } from "lucide-react"
import { PageContainer, PageHeader, PageContent } from "@/components/ui/PageContainer"

export default function CreateTicketPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/tickets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Ticket créé:", data)
        router.push("/client?message=Ticket créé avec succès")
      } else {
        const error = await response.json()
        console.error("Erreur lors de la création:", error)
        alert("Erreur lors de la création du ticket")
      }
    } catch (error) {
      console.error("Erreur lors de la création du ticket:", error)
      alert("Erreur lors de la création du ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <PageContainer size="md">
      <PageContent>
        <PageHeader>
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Nouveau Ticket</span>
            </div>
          </div>
        </PageHeader>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Créer un ticket de support
              </CardTitle>
              <CardDescription>
                Décrivez votre problème et notre équipe vous répondra dans les plus brefs délais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sujet */}
                <div>
                  <Label htmlFor="subject">Sujet *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Ex: Problème avec ma campagne Google Ads"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Problème technique</SelectItem>
                      <SelectItem value="billing">Facturation</SelectItem>
                      <SelectItem value="optimization">Optimisation de campagne</SelectItem>
                      <SelectItem value="account">Gestion de compte</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priorité */}
                <div>
                  <Label htmlFor="priority">Priorité *</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Décrivez votre problème en détail..."
                    rows={6}
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => router.back()}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Send className="w-4 h-4 mr-2" />
                    {isLoading ? "Création..." : "Créer le ticket"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </PageContent>
    </PageContainer>
  )
} 