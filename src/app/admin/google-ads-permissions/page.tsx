"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
// AdminLayout retiré: fourni par app/admin/layout.tsx
import { 
  Users, 
  Settings, 
  Shield, 
  Plus, 
  Trash2, 
  Eye, 
  Edit, 
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface GoogleAdsPermission {
  id: string
  clientAccountId: string
  userId: string
  googleAdsCustomerId: string
  permissions: {
    read: boolean
    write: boolean
    admin: boolean
  }
  isActive: boolean
  createdAt: string
  clientAccount?: {
    user: {
      firstName: string
      lastName: string
      email: string
    }
    company: {
      name: string
    }
  }
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  clientAccount?: {
    id: string
    company: {
      name: string
    }
  }
}

export default function GoogleAdsPermissionsPage() {
  const [permissions, setPermissions] = useState<GoogleAdsPermission[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPermission, setNewPermission] = useState({
    clientAccountId: "",
    googleAdsCustomerId: "",
    permissions: {
      read: true,
      write: false,
      admin: false
    }
  })

  useEffect(() => {
    fetchPermissions()
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/users?role=CLIENT')
      if (response.ok) {
        const data = await response.json()
        setClients(data.users || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/google-ads-permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPermission = async () => {
    if (!newPermission.clientAccountId || !newPermission.googleAdsCustomerId) {
      alert("Sélectionnez un client et renseignez l'ID Google Ads")
      return
    }

    try {
      const response = await fetch('/api/admin/google-ads-permissions/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPermission),
      })

      const data = await response.json()

      if (response.ok) {
        setShowAddForm(false)
        setNewPermission({
          clientAccountId: "",
          googleAdsCustomerId: "",
          permissions: {
            read: true,
            write: false,
            admin: false
          }
        })
        fetchPermissions()
        alert('Permission ajoutée avec succès !')
      } else {
        alert(`Erreur: ${data.error || 'Erreur lors de l\'ajout de permission'}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de permission:', error)
      alert('Erreur de connexion lors de l\'ajout de permission')
    }
  }

  const handleTogglePermission = async (permissionId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/google-ads-permissions/${permissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        fetchPermissions()
      }
    } catch (error) {
      console.error('Erreur lors de la modification de permission:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des permissions...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Permissions Google Ads</h1>
          <p className="text-gray-600 mt-2">
            Gérez les accès aux comptes Google Ads via le MCC
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter une Permission
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nouvelle Permission</CardTitle>
            <CardDescription>
              Ajouter une permission pour un client sur un compte Google Ads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientAccountId">Sélectionner un Client</Label>
                <Select
                  value={newPermission.clientAccountId}
                  onValueChange={(value) => setNewPermission({
                    ...newPermission,
                    clientAccountId: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rechercher un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.filter((client) => !!client.clientAccount?.id).map((client) => (
                      <SelectItem key={client.clientAccount!.id} value={client.clientAccount!.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {client.firstName || 'Prénom'} {client.lastName || 'Nom'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {client.email || 'Email'} - {client.clientAccount?.company?.name || client.company || 'Entreprise'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="googleAdsCustomerId">ID Compte Google Ads</Label>
                <Input
                  id="googleAdsCustomerId"
                  value={newPermission.googleAdsCustomerId}
                  onChange={(e) => setNewPermission({
                    ...newPermission,
                    googleAdsCustomerId: e.target.value
                  })}
                  placeholder="ID du compte Google Ads"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="read"
                    checked={newPermission.permissions.read}
                    onCheckedChange={(checked) => setNewPermission({
                      ...newPermission,
                      permissions: { ...newPermission.permissions, read: checked }
                    })}
                  />
                  <Label htmlFor="read" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Lecture
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="write"
                    checked={newPermission.permissions.write}
                    onCheckedChange={(checked) => setNewPermission({
                      ...newPermission,
                      permissions: { ...newPermission.permissions, write: checked }
                    })}
                  />
                  <Label htmlFor="write" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Écriture
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="admin"
                    checked={newPermission.permissions.admin}
                    onCheckedChange={(checked) => setNewPermission({
                      ...newPermission,
                      permissions: { ...newPermission.permissions, admin: checked }
                    })}
                  />
                  <Label htmlFor="admin" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Administration
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPermission} disabled={!newPermission.clientAccountId || !newPermission.googleAdsCustomerId}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des permissions */}
      <div className="grid gap-6">
        {permissions.map((permission) => (
          <Card key={permission.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permission Google Ads
                  </CardTitle>
                  <CardDescription>
                    {permission.clientAccount?.user.firstName} {permission.clientAccount?.user.lastName} 
                    - {permission.clientAccount?.company.name}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={permission.isActive ? "default" : "secondary"}>
                    {permission.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={permission.isActive}
                    onCheckedChange={(checked) => handleTogglePermission(permission.id, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Compte Client</Label>
                  <p className="text-sm">{permission.clientAccountId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Compte Google Ads</Label>
                  <p className="text-sm">{permission.googleAdsCustomerId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Permissions</Label>
                  <div className="flex gap-2 mt-1">
                    {permission.permissions.read && (
                      <Badge variant="outline" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Lecture
                      </Badge>
                    )}
                    {permission.permissions.write && (
                      <Badge variant="outline" className="text-xs">
                        <Edit className="w-3 h-3 mr-1" />
                        Écriture
                      </Badge>
                    )}
                    {permission.permissions.admin && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Créé le</Label>
                  <p className="text-sm">{new Date(permission.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {permissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune permission configurée</h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter des permissions pour permettre aux clients d'accéder à leurs comptes Google Ads.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Permission
            </Button>
          </CardContent>
        </Card>
      )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 