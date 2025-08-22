"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Send, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { trackDemoRequest } from '@/lib/prospect-tracking'

interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setIsSubmitted(true)
        toast.success('Message envoyé avec succès !')
        
        // Tracker l'interaction si on a un prospectId
        if (result.prospectId) {
          trackDemoRequest(result.prospectId)
        }
        
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          message: ''
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi du message')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
        <p className="text-gray-600 mb-6">
          Merci pour votre message. Nous vous recontacterons dans les plus brefs délais.
        </p>
        <Button 
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Envoyer un autre message
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent">
          Contactez-nous
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Prêt à transformer vos campagnes ? Parlons de votre projet.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Prénom *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Nom *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="votre@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">
              Entreprise
            </Label>
            <Input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nom de votre entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              placeholder="Parlez-nous de votre projet, vos objectifs, votre budget..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer le message
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            En soumettant ce formulaire, vous acceptez que vos données soient traitées pour vous recontacter.
          </p>
        </form>
      </CardContent>
    </Card>
  )
} 