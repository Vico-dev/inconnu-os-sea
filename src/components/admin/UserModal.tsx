"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Save, UserPlus } from "lucide-react"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: any) => void
  user?: any
}

export function UserModal({ isOpen, onClose, onSubmit, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "CLIENT",
    password: "",
    company: "",
    phone: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
    billingCountry: "France"
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        role: user.role || "CLIENT",
        password: "",
        company: user.company || "",
        phone: user.phone || "",
        billingAddress: "",
        billingCity: "",
        billingPostalCode: "",
        billingCountry: "France"
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        role: "CLIENT",
        password: "",
        company: "",
        phone: "",
        billingAddress: "",
        billingCity: "",
        billingPostalCode: "",
        billingCountry: "France"
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                {user ? "Modifier l&apos;utilisateur" : "Créer un utilisateur"}
              </CardTitle>
              <CardDescription>
                {user ? "Modifiez les informations de l&apos;utilisateur" : "Créez un nouvel utilisateur"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Rôle *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Client</SelectItem>
                  <SelectItem value="ACCOUNT_MANAGER">Account Manager</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!user && (
              <div>
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* Informations de facturation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Informations de facturation</h3>
              
              <div>
                <Label htmlFor="billingAddress">Adresse de facturation</Label>
                <Textarea
                  id="billingAddress"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  placeholder="123 Rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <Label htmlFor="billingCity">Ville</Label>
                  <Input
                    id="billingCity"
                    value={formData.billingCity}
                    onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="billingPostalCode">Code postal</Label>
                  <Input
                    id="billingPostalCode"
                    value={formData.billingPostalCode}
                    onChange={(e) => setFormData({ ...formData, billingPostalCode: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="billingCountry">Pays</Label>
                  <Input
                    id="billingCountry"
                    value={formData.billingCountry}
                    onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Enregistrement..." : user ? "Modifier" : "Créer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 