'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import MandateLegalTerms from '@/components/client/MandateLegalTerms'

interface MonthlyBudget {
  month: number
  amount: number
}

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
  totalAnnualBudget: number | null
  monthlyBudgets: MonthlyBudget[] | null
  budgetType: string | null
  termsAccepted: boolean
  gdprAccepted: boolean
  createdAt: string
  updatedAt: string
}

export default function MandatePage() {
  const [mandate, setMandate] = useState<AdvertisingMandate | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    signedByName: '',
    signedByEmail: '',
    budgetType: 'FIXED' as 'FIXED' | 'VARIABLE',
    totalAnnualBudget: '',
    monthlyBudgets: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, amount: 0 })) as MonthlyBudget[]
  })

  // États juridiques
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [scrollData, setScrollData] = useState({
    maxScroll: 0,
    timeSpent: 0,
    scrollEvents: 0
  })

  // Charger le mandat actuel
  useEffect(() => {
    fetchMandate()
    startTracking()
  }, [])

  const startTracking = () => {
    let startTime = Date.now()
    let maxScroll = 0
    let scrollEvents = 0

    const trackScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      maxScroll = Math.max(maxScroll, scrollPercent)
      scrollEvents++
    }

    const trackTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      setScrollData({
        maxScroll,
        timeSpent,
        scrollEvents
      })
    }

    window.addEventListener('scroll', trackScroll)
    const timeInterval = setInterval(trackTime, 1000)

    return () => {
      window.removeEventListener('scroll', trackScroll)
      clearInterval(timeInterval)
    }
  }

  const fetchMandate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/client/mandate')
      const result = await response.json()

      if (result.success && result.data) {
        setMandate(result.data)
        
        // Parser monthlyBudgets de manière plus robuste
        let parsedMonthlyBudgets = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, amount: 0 }))
        
        if (result.data.monthlyBudgets) {
          try {
            if (typeof result.data.monthlyBudgets === 'string') {
              const parsed = JSON.parse(result.data.monthlyBudgets)
              if (Array.isArray(parsed)) {
                parsedMonthlyBudgets = parsed
              }
            } else if (Array.isArray(result.data.monthlyBudgets)) {
              parsedMonthlyBudgets = result.data.monthlyBudgets
            }
          } catch (e) {
            console.error('Erreur parsing monthlyBudgets:', e)
            // Garder l'array par défaut en cas d'erreur
          }
        }

        setFormData({
          signedByName: result.data.signedByName || '',
          signedByEmail: result.data.signedByEmail || '',
          budgetType: result.data.budgetType || 'FIXED',
          totalAnnualBudget: result.data.totalAnnualBudget ? result.data.totalAnnualBudget.toString() : '',
          monthlyBudgets: parsedMonthlyBudgets
        })
        setTermsAccepted(result.data.termsAccepted || false)
        setGdprAccepted(result.data.gdprAccepted || false)
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du mandat:', error)
      toast.error('Erreur lors du chargement du mandat')
    } finally {
      setLoading(false)
    }
  }

  const handleMonthlyBudgetChange = (month: number, value: string) => {
    const newMonthlyBudgets = formData.monthlyBudgets.map(mb =>
      mb.month === month ? { ...mb, amount: parseFloat(value) || 0 } : mb
    )
    setFormData(prev => ({ ...prev, monthlyBudgets: newMonthlyBudgets }))
  }

  const calculateTotalMonthlyBudget = () => {
    return formData.monthlyBudgets.reduce((sum, mb) => sum + mb.amount, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.signedByName || !formData.signedByEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires (Nom, Email).')
      return
    }

    if (!termsAccepted || !gdprAccepted) {
      toast.error('Vous devez accepter les conditions et le traitement des données.')
      return
    }

    if (formData.budgetType === 'FIXED' && (!formData.totalAnnualBudget || parseFloat(formData.totalAnnualBudget) <= 0)) {
      toast.error('Veuillez indiquer un budget annuel valide.')
      return
    }

    if (formData.budgetType === 'VARIABLE' && calculateTotalMonthlyBudget() <= 0) {
      toast.error('Veuillez indiquer des budgets mensuels valides.')
      return
    }

    setIsSubmitting(true)

    try {
      const url = '/api/client/mandate'
      const method = mandate ? 'PUT' : 'POST'
      const body = {
        mandateId: mandate?.id, // Only for PUT
        signedByName: formData.signedByName,
        signedByEmail: formData.signedByEmail,
        budgetType: formData.budgetType,
        totalAnnualBudget: formData.budgetType === 'FIXED' ? parseFloat(formData.totalAnnualBudget) : calculateTotalMonthlyBudget(),
        monthlyBudgets: formData.budgetType === 'VARIABLE' ? formData.monthlyBudgets : null,
        termsAccepted,
        gdprAccepted,
        consentData: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        scrollTracking: scrollData
      }

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

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

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
            <div className="mt-4">
              <p className="text-sm text-gray-600">Budget Média</p>
              <p className="font-medium">
                {mandate.budgetType === 'FIXED' && mandate.totalAnnualBudget ? 
                  `Annuel fixe: ${mandate.totalAnnualBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}` :
                  mandate.budgetType === 'VARIABLE' && mandate.totalAnnualBudget ?
                  `Mensuel variable (Total annuel: ${mandate.totalAnnualBudget.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})` :
                  'Non défini'
                }
              </p>
              {mandate.budgetType === 'VARIABLE' && mandate.monthlyBudgets && (
                <div className="mt-2 text-sm text-gray-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {(() => {
                    try {
                      const monthlyData = typeof mandate.monthlyBudgets === 'string' 
                        ? JSON.parse(mandate.monthlyBudgets) 
                        : mandate.monthlyBudgets
                      
                      if (Array.isArray(monthlyData)) {
                        return monthlyData.map((mb, index) => (
                          <div key={mb.month}>
                            {months[index]}: {mb.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </div>
                        ))
                      }
                      return null
                    } catch (e) {
                      console.error('Erreur affichage budgets mensuels:', e)
                      return null
                    }
                  })()}
                </div>
              )}
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Budget Média Annuel *</h3>
              <RadioGroup 
                defaultValue="FIXED" 
                value={formData.budgetType} 
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, budgetType: value as 'FIXED' | 'VARIABLE', totalAnnualBudget: '', monthlyBudgets: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, amount: 0 })) }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FIXED" id="budget-fixed" />
                  <Label htmlFor="budget-fixed">Montant fixe annuel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="VARIABLE" id="budget-variable" />
                  <Label htmlFor="budget-variable">Montant variable par mois</Label>
                </div>
              </RadioGroup>

              {formData.budgetType === 'FIXED' && (
                <div>
                  <Label htmlFor="totalAnnualBudget">Budget Annuel Total (€) *</Label>
                  <Input
                    id="totalAnnualBudget"
                    type="number"
                    value={formData.totalAnnualBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAnnualBudget: e.target.value }))}
                    placeholder="Ex: 12000"
                    min="0"
                    required
                  />
                </div>
              )}

              {formData.budgetType === 'VARIABLE' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Indiquez le budget pour chaque mois :</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {months.map((monthName, index) => (
                      <div key={index}>
                        <Label htmlFor={`month-${index + 1}`}>{monthName}</Label>
                        <Input
                          id={`month-${index + 1}`}
                          type="number"
                          value={formData.monthlyBudgets.find(mb => mb.month === index + 1)?.amount || ''}
                          onChange={(e) => handleMonthlyBudgetChange(index + 1, e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-right font-medium mt-2">
                    Total Annuel Estimé: {calculateTotalMonthlyBudget().toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              )}
            </div>

            {/* Conditions légales */}
            <MandateLegalTerms
              onTermsAccepted={setTermsAccepted}
              onGdprAccepted={setGdprAccepted}
              termsAccepted={termsAccepted}
              gdprAccepted={gdprAccepted}
            />

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