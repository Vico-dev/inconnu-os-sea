"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Loader2, Send, Users, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

interface EmailReminderStats {
  totalAccounts: number
  eligibleAccounts: number
  sentReminders: number
  pendingReminders: number
}

interface ReminderDetail {
  accountId: string
  email: string
  reminderType: string
  status: string
  error?: string
}

export default function EmailRemindersPage() {
  const [stats, setStats] = useState<EmailReminderStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [lastResults, setLastResults] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/email-reminders/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
    }
  }

  const sendReminders = async () => {
    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/email-reminders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message
        })
        setLastResults(data.results)
        fetchStats() // Rafraîchir les stats
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Erreur lors de l\'envoi des relances'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur de connexion'
      })
    } finally {
      setIsSending(false)
    }
  }

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'REMINDER_1': return 'Jour 1'
      case 'REMINDER_2': return 'Jour 3'
      case 'REMINDER_3': return 'Jour 7'
      case 'REMINDER_4': return 'Jour 14'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Envoyé</Badge>
      case 'already_sent_or_not_due':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Déjà envoyé</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Erreur</Badge>
    }
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des relances email</h1>
          <p className="text-gray-600 mt-2">
            Gérez les emails de relance automatiques pour les comptes non activés
          </p>
        </div>
        <Button 
          onClick={sendReminders} 
          disabled={isSending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Envoyer les relances
            </>
          )}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total comptes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Éligibles</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.eligibleAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relances envoyées</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sentReminders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReminders}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informations sur les relances */}
      <Card>
        <CardHeader>
          <CardTitle>Séquence de relance</CardTitle>
          <CardDescription>
            Les emails de relance sont envoyés automatiquement selon cette séquence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Jour 1 - Premier rappel</h4>
                <p className="text-sm text-gray-600">Rappel doux avec les bénéfices du service</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">REMINDER_1</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Jour 3 - Témoignages</h4>
                <p className="text-sm text-gray-600">Partage de témoignages clients satisfaits</p>
              </div>
              <Badge className="bg-green-100 text-green-800">REMINDER_2</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Jour 7 - Urgence</h4>
                <p className="text-sm text-gray-600">Ton plus urgent avec statistiques de perte</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">REMINDER_3</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Jour 14 - Dernière chance</h4>
                <p className="text-sm text-gray-600">Dernier email avec impact business détaillé</p>
              </div>
              <Badge className="bg-red-100 text-red-800">REMINDER_4</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats du dernier envoi */}
      {lastResults && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats du dernier envoi</CardTitle>
            <CardDescription>
              Détails des emails envoyés lors de la dernière exécution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastResults.details.map((detail: ReminderDetail, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{detail.email}</p>
                    {detail.reminderType && (
                      <p className="text-sm text-gray-600">
                        Type: {getReminderTypeLabel(detail.reminderType)}
                      </p>
                    )}
                    {detail.error && (
                      <p className="text-sm text-red-600">Erreur: {detail.error}</p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(detail.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 