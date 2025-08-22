"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  company?: any
}

export function CompanyModal({ isOpen, onClose, onSubmit, company }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    teamSize: "",
    goals: "",
    currentChallenges: ""
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        website: company.website || "",
        industry: company.industry || "",
        teamSize: company.teamSize || "",
        goals: company.goals || "",
        currentChallenges: company.currentChallenges || ""
      })
    } else {
      setFormData({
        name: "",
        website: "",
        industry: "",
        teamSize: "",
        goals: "",
        currentChallenges: ""
      })
    }
  }, [company])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {company ? "Modifier l'entreprise" : "Créer une entreprise"}
          </DialogTitle>
          <DialogDescription>
            {company ? "Modifiez les informations de l'entreprise" : "Créez une nouvelle entreprise"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de l'entreprise *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Secteur d'activité *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleChange("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Formation">Formation</SelectItem>
                  <SelectItem value="Santé">Santé</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Immobilier">Immobilier</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teamSize">Taille de l'équipe</Label>
              <Select value={formData.teamSize} onValueChange={(value) => handleChange("teamSize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une taille" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1-5 employés</SelectItem>
                  <SelectItem value="5-10">5-10 employés</SelectItem>
                  <SelectItem value="10-25">10-25 employés</SelectItem>
                  <SelectItem value="25-50">25-50 employés</SelectItem>
                  <SelectItem value="50-100">50-100 employés</SelectItem>
                  <SelectItem value="100+">100+ employés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="goals">Objectifs</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => handleChange("goals", e.target.value)}
              placeholder="Décrivez les objectifs de l'entreprise..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="currentChallenges">Défis actuels</Label>
            <Textarea
              id="currentChallenges"
              value={formData.currentChallenges}
              onChange={(e) => handleChange("currentChallenges", e.target.value)}
              placeholder="Décrivez les défis actuels de l'entreprise..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {company ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 