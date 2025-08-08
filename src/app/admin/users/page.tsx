"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { UserModal } from "@/components/admin/UserModal"
import { 
  Users, 
  UserPlus,
  Search,
  Settings
} from "lucide-react"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setShowCreateModal(true)
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        await fetchUsers()
        setShowCreateModal(false)
        setEditingUser(null)
      }
    } catch (error) {
      console.error("Erreur lors de la création de l&apos;utilisateur:", error)
    }
  }

  const filteredUsers = users.filter((user: any) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">Gérez tous les utilisateurs de la plateforme</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription>
                    Gérez tous les utilisateurs de la plateforme
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer un utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.clientAccount?.company && (
                          <p className="text-xs text-gray-500">
                            {user.clientAccount.company.name} - {user.clientAccount.company.industry}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        user.role === "ADMIN" ? "destructive" : 
                        user.role === "ACCOUNT_MANAGER" ? "default" : 
                        "secondary"
                      }>
                        {user.role === "CLIENT" ? "Client" : 
                         user.role === "ACCOUNT_MANAGER" ? "Account Manager" : 
                         user.role === "ADMIN" ? "Admin" : user.role}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modal de création/édition d&apos;utilisateur */}
          <UserModal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false)
              setEditingUser(null)
            }}
            onSubmit={handleCreateUser}
            user={editingUser}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 