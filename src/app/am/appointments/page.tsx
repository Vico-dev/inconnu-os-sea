"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useRouter } from "next/navigation"
import { Calendar, Plus, Clock, User } from "lucide-react"

export default function AMAppointmentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "ACCOUNT_MANAGER") {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments/am?amId=${user?.accountManager?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rendez-vous:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <AMLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
            </div>
          </div>
        </AMLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes Rendez-vous</h1>
            <p className="text-gray-600">Gérez vos rendez-vous avec les clients</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Rendez-vous</CardTitle>
                  <CardDescription>
                    Liste de vos rendez-vous programmés
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/am/appointments/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un RDV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun rendez-vous programmé</p>
                    <p className="text-sm">Créez votre premier rendez-vous</p>
                  </div>
                ) : (
                  appointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{appointment.title}</h3>
                            <Badge variant={
                              appointment.status === "SCHEDULED" ? "default" :
                              appointment.status === "CONFIRMED" ? "secondary" :
                              appointment.status === "COMPLETED" ? "outline" :
                              "destructive"
                            }>
                              {appointment.status === "SCHEDULED" ? "Programmé" :
                               appointment.status === "CONFIRMED" ? "Confirmé" :
                               appointment.status === "COMPLETED" ? "Terminé" :
                               "Annulé"}
                            </Badge>
                          </div>
                          {appointment.description && (
                            <p className="text-gray-600 mb-2">{appointment.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{appointment.client.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(appointment.startTime).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                                {new Date(appointment.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </ProtectedRoute>
  )
} 