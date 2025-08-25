'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Calendar, Download, FileText, BarChart3, TrendingUp, Users, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
  company: string
  monthlyBudget: number
  status: string
}

export default function AMReportsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [reportFormat, setReportFormat] = useState<'PDF' | 'EXCEL'>('PDF')
  const [includeRecommendations, setIncludeRecommendations] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportPeriod, setReportPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    fetchMyClients()
  }, [])

  const fetchMyClients = async () => {
    try {
      const response = await fetch('/api/am/stats')
      if (response.ok) {
        const data = await response.json()
        const formattedClients = data.clients?.map((client: any) => ({
          id: client.clientAccountId,
          name: `${client.userName}`,
          email: client.userEmail,
          company: client.companyName,
          monthlyBudget: client.monthlyBudget || 1000,
          status: client.status || 'ACTIVE'
        })) || []
        setClients(formattedClients)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de vos clients:', error)
      toast.error('Erreur lors de la récupération de vos clients')
    }
  }

  const generateReport = async () => {
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client')
      return
    }

    setIsGenerating(true)
    toast.loading('Génération du rapport en cours...')

    try {
      // Calculer la période
      let startDate: Date
      let endDate: Date = new Date()

      switch (reportPeriod) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        case 'custom':
          if (!customStartDate || !customEndDate) {
            toast.error('Veuillez sélectionner une période personnalisée')
            return
          }
          startDate = new Date(customStartDate)
          endDate = new Date(customEndDate)
          break
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }

      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientAccountId: selectedClient,
          format: reportFormat,
          includeRecommendations,
          customPeriod: {
            start: startDate,
            end: endDate
          }
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rapport-google-ads-${Date.now()}.${reportFormat.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.dismiss()
        toast.success('Rapport généré avec succès !')
      } else {
        const error = await response.json()
        toast.dismiss()
        toast.error(error.error || 'Erreur lors de la génération du rapport')
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      toast.dismiss()
      toast.error('Erreur lors de la génération du rapport')
    } finally {
      setIsGenerating(false)
    }
  }

  const getSelectedClientInfo = () => {
    return clients.find(client => client.id === selectedClient)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports Clients</h1>
          <p className="text-gray-600 mt-2">
            Générez des rapports détaillés pour vos clients assignés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span className="text-sm text-gray-500">Génération de rapports</span>
        </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration du rapport */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Configuration du rapport
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sélection du client */}
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un de vos clients" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-sm text-gray-500">{client.company}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Aucun client assigné pour le moment.
                  </p>
                )}
              </div>

              {/* Format du rapport */}
              <div className="space-y-2">
                <Label htmlFor="format">Format du rapport</Label>
                <Select value={reportFormat} onValueChange={(value: 'PDF' | 'EXCEL') => setReportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="EXCEL">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Excel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Période du rapport */}
              <div className="space-y-2">
                <Label htmlFor="period">Période du rapport</Label>
                <Select value={reportPeriod} onValueChange={(value: '7d' | '30d' | '90d' | 'custom') => setReportPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 derniers jours</SelectItem>
                    <SelectItem value="30d">30 derniers jours</SelectItem>
                    <SelectItem value="90d">90 derniers jours</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Période personnalisée */}
              {reportPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <input
                      type="date"
                      id="startDate"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <input
                      type="date"
                      id="endDate"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Options du rapport */}
              <div className="space-y-3">
                <Label>Options du rapport</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={includeRecommendations}
                    onCheckedChange={(checked) => setIncludeRecommendations(checked as boolean)}
                  />
                  <Label htmlFor="recommendations" className="text-sm">
                    Inclure les recommandations d'optimisation
                  </Label>
                </div>
              </div>

              {/* Bouton de génération */}
              <Button
                onClick={generateReport}
                disabled={!selectedClient || isGenerating || clients.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Générer le rapport
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informations du client sélectionné */}
        <div className="space-y-6">
          {selectedClient && getSelectedClientInfo() ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nom</Label>
                  <p className="text-lg font-semibold">{getSelectedClientInfo()?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Entreprise</Label>
                  <p className="text-lg font-semibold">{getSelectedClientInfo()?.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{getSelectedClientInfo()?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Budget mensuel</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {getSelectedClientInfo()?.monthlyBudget}€
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Statut</Label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {getSelectedClientInfo()?.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Sélectionnez un client
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-500 text-sm">
                  Choisissez un de vos clients dans la liste pour voir ses informations et générer un rapport personnalisé.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Statistiques rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mes statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{clients.length}</p>
                  <p className="text-sm text-gray-500">Clients assignés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {clients.filter(c => c.status === 'ACTIVE').length}
                  </p>
                  <p className="text-sm text-gray-500">Clients actifs</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {clients.reduce((sum, client) => sum + client.monthlyBudget, 0).toLocaleString()}€
                </p>
                <p className="text-sm text-gray-500">Budget total géré</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 