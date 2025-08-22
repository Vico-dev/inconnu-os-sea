"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react'

type ProspectStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'

interface Prospect {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  source: string
  status: ProspectStatus
  notes: string | null
  score: number | null
  budget: number | null
  industry: string | null
  teamSize: string | null
  urgency: 'low' | 'medium' | 'high' | null
  engagement: 'low' | 'medium' | 'high' | null
  createdAt: string
  updatedAt: string
}

const statusColors: Record<ProspectStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
  LOST: 'bg-red-100 text-red-800'
}

const statusLabels: Record<ProspectStatus, string> = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  CONVERTED: 'Converti',
  LOST: 'Perdu'
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [scoreFilter, setScoreFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showScoringModal, setShowScoringModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Fonction de calcul de score automatique
  const calculateScore = (prospect: Prospect): number => {
    let score = 0
    
    // Score basé sur le budget
    if (prospect.budget) {
      if (prospect.budget >= 5000) score += 30
      else if (prospect.budget >= 2000) score += 20
      else if (prospect.budget >= 1000) score += 15
      else if (prospect.budget >= 500) score += 10
      else score += 5
    }
    
    // Score basé sur la taille de l'équipe
    if (prospect.teamSize) {
      if (prospect.teamSize === '50-100' || prospect.teamSize === '100+') score += 20
      else if (prospect.teamSize === '25-50') score += 15
      else if (prospect.teamSize === '10-25') score += 10
      else if (prospect.teamSize === '5-10') score += 8
      else score += 5
    }
    
    // Score basé sur l'urgence
    if (prospect.urgency === 'high') score += 25
    else if (prospect.urgency === 'medium') score += 15
    else if (prospect.urgency === 'low') score += 5
    
    // Score basé sur l'engagement
    if (prospect.engagement === 'high') score += 20
    else if (prospect.engagement === 'medium') score += 12
    else if (prospect.engagement === 'low') score += 5
    
    // Score basé sur le secteur d'activité
    if (prospect.industry) {
      const highValueIndustries = ['E-commerce', 'SaaS', 'B2B', 'Finance']
      if (highValueIndustries.includes(prospect.industry)) score += 15
      else score += 8
    }
    
    // Score basé sur la source
    if (prospect.source === 'website') score += 10
    else if (prospect.source === 'referral') score += 15
    else if (prospect.source === 'social') score += 8
    else score += 5
    
    return Math.min(score, 100) // Score maximum de 100
  }

  // Fonction pour obtenir la couleur du score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Fonction pour obtenir le niveau de priorité
  const getPriorityLevel = (score: number): string => {
    if (score >= 80) return 'Très haute'
    if (score >= 60) return 'Haute'
    if (score >= 40) return 'Moyenne'
    return 'Basse'
  }

  const fetchProspects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prospects')
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      setProspects(data.prospects || [])
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error)
      setError('Erreur lors du chargement des prospects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProspects()
  }, [])

  const updateProspectStatus = async (prospectId: string, newStatus: ProspectStatus) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setProspects(prev => 
          prev.map(prospect => 
            prospect.id === prospectId 
              ? { ...prospect, status: newStatus }
              : prospect
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const updateProspectNotes = async (prospectId: string, notes: string) => {
    try {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        setProspects(prev => 
          prev.map(prospect => 
            prospect.id === prospectId 
              ? { ...prospect, notes }
              : prospect
          )
        )
        setShowEditModal(false)
        setSelectedProspect(null)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error)
    }
  }

  const loadAnalytics = async (prospectId: string) => {
    setLoadingAnalytics(true)
    try {
      const response = await fetch(`/api/prospects/${prospectId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data.data)
        setShowAnalyticsModal(true)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const filteredProspects = prospects.filter(prospect => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      prospect.firstName.toLowerCase().includes(searchLower) ||
      prospect.lastName.toLowerCase().includes(searchLower) ||
      prospect.email.toLowerCase().includes(searchLower) ||
      (prospect.company && prospect.company.toLowerCase().includes(searchLower))
    )
    
    const matchesStatus = !statusFilter || prospect.status === statusFilter
    
    const prospectScore = calculateScore(prospect)
    const matchesScore = !scoreFilter || 
      (scoreFilter === 'high' && prospectScore >= 80) ||
      (scoreFilter === 'medium' && prospectScore >= 60 && prospectScore < 80) ||
      (scoreFilter === 'low' && prospectScore < 60)
    
    const matchesPriority = !priorityFilter || 
      (priorityFilter === 'very-high' && prospectScore >= 80) ||
      (priorityFilter === 'high' && prospectScore >= 60 && prospectScore < 80) ||
      (priorityFilter === 'medium' && prospectScore >= 40 && prospectScore < 60) ||
      (priorityFilter === 'low' && prospectScore < 40)
    
    return matchesSearch && matchesStatus && matchesScore && matchesPriority
  })

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchProspects} variant="outline">
            Réessayer
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Prospects</h1>
          <p className="text-gray-600">Gérez vos prospects et leads</p>
        </div>
        <Button onClick={fetchProspects} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{prospects.length}</div>
            <div className="text-sm text-gray-600">Total Prospects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {prospects.filter(p => p.status === 'NEW').length}
            </div>
            <div className="text-sm text-gray-600">Nouveaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {prospects.filter(p => p.status === 'QUALIFIED').length}
            </div>
            <div className="text-sm text-gray-600">Qualifiés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {prospects.filter(p => p.status === 'CONVERTED').length}
            </div>
            <div className="text-sm text-gray-600">Convertis</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un prospect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtres multiples */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre par statut */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === '' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('')}
                    size="sm"
                  >
                    Tous
                  </Button>
                  <Button
                    variant={statusFilter === 'NEW' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('NEW')}
                    size="sm"
                  >
                    Nouveaux
                  </Button>
                  <Button
                    variant={statusFilter === 'QUALIFIED' ? 'default' : 'outline'}
                    onClick={() => setStatusFilter('QUALIFIED')}
                    size="sm"
                  >
                    Qualifiés
                  </Button>
                </div>
              </div>

              {/* Filtre par score */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Score</label>
                <div className="flex gap-2">
                  <Button
                    variant={scoreFilter === '' ? 'default' : 'outline'}
                    onClick={() => setScoreFilter('')}
                    size="sm"
                  >
                    Tous
                  </Button>
                  <Button
                    variant={scoreFilter === 'high' ? 'default' : 'outline'}
                    onClick={() => setScoreFilter('high')}
                    size="sm"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    80+
                  </Button>
                  <Button
                    variant={scoreFilter === 'medium' ? 'default' : 'outline'}
                    onClick={() => setScoreFilter('medium')}
                    size="sm"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    60-79
                  </Button>
                  <Button
                    variant={scoreFilter === 'low' ? 'default' : 'outline'}
                    onClick={() => setScoreFilter('low')}
                    size="sm"
                    className="bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    &lt;60
                  </Button>
                </div>
              </div>

              {/* Filtre par priorité */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priorité</label>
                <div className="flex gap-2">
                  <Button
                    variant={priorityFilter === '' ? 'default' : 'outline'}
                    onClick={() => setPriorityFilter('')}
                    size="sm"
                  >
                    Toutes
                  </Button>
                  <Button
                    variant={priorityFilter === 'very-high' ? 'default' : 'outline'}
                    onClick={() => setPriorityFilter('very-high')}
                    size="sm"
                    className="bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Très haute
                  </Button>
                  <Button
                    variant={priorityFilter === 'high' ? 'default' : 'outline'}
                    onClick={() => setPriorityFilter('high')}
                    size="sm"
                    className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                  >
                    Haute
                  </Button>
                  <Button
                    variant={priorityFilter === 'medium' ? 'default' : 'outline'}
                    onClick={() => setPriorityFilter('medium')}
                    size="sm"
                    className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  >
                    Moyenne
                  </Button>
                </div>
              </div>

              {/* Compteur */}
              <div className="text-sm text-gray-500 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                {filteredProspects.length} prospect{filteredProspects.length > 1 ? 's' : ''} trouvé{filteredProspects.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prospects */}
      <div className="grid gap-4">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-900 to-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {prospect.firstName} {prospect.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {prospect.email}
                        </div>
                        {prospect.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {prospect.phone}
                          </div>
                        )}
                        {prospect.company && (
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {prospect.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {prospect.message && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </div>
                      <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                        {prospect.message}
                      </p>
                    </div>
                  )}

                  {prospect.notes && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Notes</div>
                      <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded">
                        {prospect.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(prospect.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {prospect.source}
                      </Badge>
                      {/* Score du prospect */}
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(calculateScore(prospect))}`}>
                          Score: {calculateScore(prospect)}/100
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPriorityLevel(calculateScore(prospect))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[prospect.status]}>
                        {statusLabels[prospect.status]}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadAnalytics(prospect.id)}
                          disabled={loadingAnalytics}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedProspect(prospect)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const nextStatus = getNextStatus(prospect.status)
                            updateProspectStatus(prospect.id, nextStatus)
                          }}
                        >
                          {getNextStatusLabel(prospect.status)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun prospect trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter 
                ? 'Aucun prospect ne correspond à vos critères de recherche.'
                : 'Aucun prospect pour le moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedProspect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Modifier {selectedProspect.firstName} {selectedProspect.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={selectedProspect.notes || ''}
                    onChange={(e) => setSelectedProspect({
                      ...selectedProspect,
                      notes: e.target.value
                    })}
                    placeholder="Ajoutez des notes sur ce prospect..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedProspect(null)
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => updateProspectNotes(selectedProspect.id, selectedProspect.notes || '')}
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal d'analytics */}
      {showAnalyticsModal && analyticsData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics - {analyticsData.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Métriques principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.totalInteractions}</div>
                      <div className="text-sm text-gray-600">Total Interactions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.engagementScore}</div>
                      <div className="text-sm text-gray-600">Score d'Engagement</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(analyticsData.conversionProbability)}%</div>
                      <div className="text-sm text-gray-600">Probabilité de Conversion</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-orange-600">{analyticsData.timeOnSite}min</div>
                      <div className="text-sm text-gray-600">Temps sur le Site</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recommandations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Parcours de conversion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Parcours de Conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {analyticsData.conversionPath.map((step: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {step}
                          </div>
                          {index < analyticsData.conversionPath.length - 1 && (
                            <div className="mx-2 text-gray-400">→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contenu préféré */}
                {analyticsData.preferredContent.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contenu Préféré</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.preferredContent.map((content: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {content}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dernières interactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dernières Interactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analyticsData.interactions.map((interaction: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{interaction.details?.description || interaction.action}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.timestamp).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAnalyticsModal(false)
                    setAnalyticsData(null)
                  }}
                >
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
    </ProtectedRoute>
  )
}

function getNextStatus(currentStatus: ProspectStatus): ProspectStatus {
  const statusFlow: Record<ProspectStatus, ProspectStatus> = {
    NEW: 'CONTACTED',
    CONTACTED: 'QUALIFIED',
    QUALIFIED: 'CONVERTED',
    CONVERTED: 'CONVERTED',
    LOST: 'NEW'
  }
  return statusFlow[currentStatus]
}

function getNextStatusLabel(currentStatus: ProspectStatus): string {
  const labels: Record<ProspectStatus, string> = {
    NEW: 'Contacter',
    CONTACTED: 'Qualifier',
    QUALIFIED: 'Convertir',
    CONVERTED: '✓',
    LOST: 'Relancer'
  }
  return labels[currentStatus]
} 