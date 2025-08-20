"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
// AdminLayout retiré: fourni par app/admin/layout.tsx
import { CompanyModal } from "@/components/admin/CompanyModal"
import { 
  Building, 
  Plus,
  Search,
  Users,
  BarChart3
} from "lucide-react"

export default function AdminCompaniesPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCompany = (company: any) => {
    setEditingCompany(company)
    setShowCreateModal(true)
  }

  const handleCreateCompany = async (companyData: any) => {
    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      })

      if (response.ok) {
        await fetchCompanies()
        setShowCreateModal(false)
        setEditingCompany(null)
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error)
    }
  }

  const filteredCompanies = companies.filter((company: any) =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.siret?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des entreprises...</p>
            </div>
          </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Entreprises</h1>
          <p className="text-gray-600">Gérez toutes les entreprises de la plateforme</p>
        </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Entreprises</CardTitle>
                  <CardDescription>
                    {companies.length} entreprise{companies.length > 1 ? 's' : ''} au total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une entreprise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                {/* Globe icon removed as per new_code */}
                                {company.website || "Aucun site web"}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {company.teamSize || "Taille non spécifiée"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Secteur :</strong> {company.industry}</p>
                              {company.goals && (
                                <p><strong>Objectifs :</strong> {company.goals}</p>
                              )}
                              {company.currentChallenges && (
                                <p><strong>Défis actuels :</strong> {company.currentChallenges}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Contacts</h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              {company.clientAccounts.map((account) => (
                                <div key={account.id} className="flex items-center space-x-2">
                                  {/* Mail icon removed as per new_code */}
                                  <span>{account.user.firstName} {account.user.lastName}</span>
                                  <span className="text-gray-500">({account.user.email})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {/* Calendar icon removed as per new_code */}
                            <span className="text-sm text-gray-500">
                              Créée le {new Date(company.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {company.clientAccounts.map((account) => (
                              <div key={account.id}>
                                {/* getStatusBadge function removed as per new_code */}
                                <Badge variant="secondary">{account.subscription?.status || "Aucun abonnement"}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="text-center py-12">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise trouvée</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Aucune entreprise ne correspond à votre recherche." : "Aucune entreprise pour le moment."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </ProtectedRoute>
  )
} 