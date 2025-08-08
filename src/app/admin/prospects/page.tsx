"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  MessageSquare,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

interface Prospect {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  source: string
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  CONVERTED: 'bg-purple-100 text-purple-800',
  LOST: 'bg-red-100 text-red-800'
}

const statusLabels = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  CONVERTED: 'Converti',
  LOST: 'Perdu'
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchProspects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/prospects?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProspects(data.prospects)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des prospects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProspects()
  }, [pagination.page, statusFilter])

  const filteredProspects = prospects.filter(prospect => {
    const searchLower = searchTerm.toLowerCase()
    return (
      prospect.firstName.toLowerCase().includes(searchLower) ||
      prospect.lastName.toLowerCase().includes(searchLower) ||
      prospect.email.toLowerCase().includes(searchLower) ||
      (prospect.company && prospect.company.toLowerCase().includes(searchLower))
    )
  })

  const updateProspectStatus = async (prospectId: string, newStatus: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
          <p className="text-gray-600">Gérez vos prospects et leads</p>
        </div>
        <Button onClick={fetchProspects} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un prospect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="NEW">Nouveau</SelectItem>
                <SelectItem value="CONTACTED">Contacté</SelectItem>
                <SelectItem value="QUALIFIED">Qualifié</SelectItem>
                <SelectItem value="CONVERTED">Converti</SelectItem>
                <SelectItem value="LOST">Perdu</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {pagination.total} prospect{pagination.total > 1 ? 's' : ''} au total
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
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(prospect.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {prospect.source}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[prospect.status as keyof typeof statusColors]}>
                        {statusLabels[prospect.status as keyof typeof statusLabels]}
                      </Badge>
                      <Select
                        value={prospect.status}
                        onValueChange={(value) => updateProspectStatus(prospect.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">Nouveau</SelectItem>
                          <SelectItem value="CONTACTED">Contacté</SelectItem>
                          <SelectItem value="QUALIFIED">Qualifié</SelectItem>
                          <SelectItem value="CONVERTED">Converti</SelectItem>
                          <SelectItem value="LOST">Perdu</SelectItem>
                        </SelectContent>
                      </Select>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
} 