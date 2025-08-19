'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface AdvertisingMandate {
  id: string
  mandateNumber: string
  status: string
  version: string
  signedByName: string | null
  signedByEmail: string | null
  signedAt: string | null
  validFrom: string | null
  validUntil: string | null
  documentUrl: string | null
  createdAt: string
  updatedAt: string
}

export default function MandatePage() {
  const [mandate, setMandate] = useState<AdvertisingMandate | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    signedByName: '',
    signedByEmail: ''
  })

  // Charger le mandat actuel
  useEffect(() => {
    fetchMandate()
  }, [])

  const fetchMandate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/client/mandate')
      const result = await response.json()

      if (result.success && result.data) {
        setMandate(result.data)
        setFormData({
          signedByName: result.data.signedByName || '',
          signedByEmail: result.data.signedByEmail || ''
        })
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du mandat:', error)
      toast.error('Erreur lors du chargement du mandat')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.signedByName || !formData.signedByEmail) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setIsSubmitting(true)

    try {
      const url = '/api/client/mandate'
      const method = mandate ? 'PUT' : 'POST'
      const body = mandate 
        ? { mandateId: mandate.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        await fetchMandate()
      } else {
        toast.error(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde du mandat')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Actif</Badge>
      case 'EXPIRED':
        return <Badge variant="destructive">Expiré</Badge>
      case 'PENDING':
        return <Badge variant="secondary">En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isExpiringSoon = (validUntil: string | null) => {
    if (!validUntil) return false
    const until = new Date(validUntil)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mandat Publicitaire</h1>
        <p className="text-gray-600 mt-2">
          Gérez votre mandat publicitaire annuel requis pour les services de publicité en ligne.
        </p>
      </div>

      {/* Statut du mandat actuel */}
      {mandate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mandat Actuel</span>
              {getStatusBadge(mandate.status)}
            </CardTitle>
            <CardDescription>
              Numéro de mandat: {mandate.mandateNumber} • Version {mandate.version}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Signé par</p>
                <p className="font-medium">{mandate.signedByName}</p>
                <p className="text-sm text-gray-500">{mandate.signedByEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Période de validité</p>
                <p className="font-medium">
                  {mandate.validFrom && mandate.validUntil ? (
                    <>
                      Du {format(new Date(mandate.validFrom), 'dd/MM/yyyy', { locale: fr })}
                      {' '}au {format(new Date(mandate.validUntil), 'dd/MM/yyyy', { locale: fr })}
                    </>
                  ) : (
                    'Non définie'
                  )}
                </p>
                {mandate.validUntil && isExpiringSoon(mandate.validUntil) && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ Expire dans {Math.ceil((new Date(mandate.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                  </p>
                )}
                {mandate.validUntil && isExpired(mandate.validUntil) && (
                  <p className="text-sm text-red-600 mt-1">
                    ❌ Mandat expiré - Renouvellement requis
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerte si pas de mandat ou mandat expiré */}
      {(!mandate || (mandate.validUntil && isExpired(mandate.validUntil))) && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">
              {!mandate ? 'Mandat Publicitaire Requis' : 'Renouvellement de Mandat Requis'}
            </CardTitle>
            <CardDescription className="text-red-700">
              {!mandate 
                ? 'Vous devez signer un mandat publicitaire pour utiliser nos services de publicité en ligne.'
                : 'Votre mandat publicitaire a expiré. Vous devez le renouveler pour continuer à utiliser nos services.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Formulaire de signature/renouvellement */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mandate ? 'Renouveler le Mandat' : 'Signer le Mandat'}
          </CardTitle>
          <CardDescription>
            {mandate 
              ? 'Renouvelez votre mandat publicitaire pour une durée d\'un an.'
              : 'Signez votre premier mandat publicitaire pour activer les services de publicité.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signedByName">Nom du signataire *</Label>
                <Input
                  id="signedByName"
                  type="text"
                  value={formData.signedByName}
                  onChange={(e) => setFormData(prev => ({ ...prev, signedByName: e.target.value }))}
                  placeholder="Nom complet"
                  required
                />
              </div>
              <div>
                <Label htmlFor="signedByEmail">Email du signataire *</Label>
                <Input
                  id="signedByEmail"
                  type="email"
                  value={formData.signedByEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, signedByEmail: e.target.value }))}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Conditions du mandat</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Le mandat est valable pour une durée d'un an à compter de la signature</li>
                <li>• Il autorise l'agence à gérer vos campagnes publicitaires en ligne</li>
                <li>• Le renouvellement annuel est obligatoire pour maintenir les services</li>
                <li>• Vous recevrez un rappel 30 jours avant l'expiration</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Traitement...' : mandate ? 'Renouveler le Mandat' : 'Signer le Mandat'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}