'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Crown, Plus, Trash2, Settings, BarChart3, TrendingUp, Users, Target, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GoogleAdsAccount {
  id: string
  customerId: string
  customerName: string
  isConnected: boolean
  isPrimary: boolean
  connectedAt?: Date
  createdAt: Date
  metrics?: {
    totalImpressions: number
    totalClicks: number
    totalCost: number
    totalConversions: number
    averageCtr: number
    averageCpc: number
    averageCpa: number
    averageRoas: number
  }
}

export default function GoogleAdsAccountsPage() {
  const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<GoogleAdsAccount | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/client/google-ads-accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error)
      toast.error('Erreur lors de la récupération des comptes Google Ads')
    } finally {
      setIsLoading(false)
    }
  }

  const setPrimaryAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/client/google-ads-accounts/${accountId}/set-primary`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Compte principal défini avec succès !')
        fetchAccounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la définition du compte principal')
      }
    } catch (error) {
      console.error('Erreur lors de la définition du compte principal:', error)
      toast.error('Erreur lors de la définition du compte principal')
    }
  }

  const removeAccount = async (accountId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte Google Ads ?')) {
      return
    }

    try {
      const response = await fetch(`/api/client/google-ads-accounts/${accountId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Compte supprimé avec succès !')
        fetchAccounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression du compte')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      toast.error('Erreur lors de la suppression du compte')
    }
  }

  const connectNewAccount = () => {
    // Rediriger vers l'OAuth Google Ads
    window.location.href = '/api/google-ads/auth?multiple=true'
  }

  const getStatusBadge = (account: GoogleAdsAccount) => {
    if (account.isPrimary) {
      return <Badge className="bg-yellow-100 text-yellow-800">Principal</Badge>
    }
    if (account.isConnected) {
      return <Badge className="bg-green-100 text-green-800">Connecté</Badge>
    }
    return <Badge variant="secondary">Déconnecté</Badge>
  }

  const getAccountStats = () => {
    const connectedAccounts = accounts.filter(acc => acc.isConnected)
    const totalImpressions = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalImpressions || 0), 0)
    const totalClicks = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalClicks || 0), 0)
    const totalCost = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalCost || 0), 0)
    const totalConversions = connectedAccounts.reduce((sum, acc) => sum + (acc.metrics?.totalConversions || 0), 0)

    return {
      totalAccounts: accounts.length,
      connectedAccounts: connectedAccounts.length,
      totalImpressions,
      totalClicks,
      totalCost,
      totalConversions
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos comptes Google Ads...</p>
        </div>
      </div>
    )
  }

  const stats = getAccountStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Comptes Google Ads</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos comptes Google Ads connectés
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-500">Gestion des comptes</span>
          </div>
          <Button onClick={connectNewAccount} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Connecter un compte
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des comptes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAccounts}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comptes connectés</p>
                <p className="text-2xl font-bold text-green-600">{stats.connectedAccounts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Impressions totales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalImpressions.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coût total</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalCost.toFixed(2)}€</p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des comptes */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Comptes Google Ads</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun compte Google Ads connecté</p>
              <p className="text-sm text-gray-400 mb-4">Connectez votre premier compte pour commencer</p>
              <Button onClick={connectNewAccount} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Connecter un compte
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{account.customerName}</h3>
                        {getStatusBadge(account)}
                        {account.isPrimary && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">ID: {account.customerId}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Connecté le: {account.connectedAt ? new Date(account.connectedAt).toLocaleDateString() : 'N/A'}</span>
                        <span>Créé le: {new Date(account.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Métriques du compte */}
                      {account.metrics && (
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Impressions</p>
                            <p className="text-lg font-semibold">{account.metrics.totalImpressions.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Clics</p>
                            <p className="text-lg font-semibold">{account.metrics.totalClicks.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">CTR</p>
                            <p className="text-lg font-semibold">{account.metrics.averageCtr.toFixed(2)}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Coût</p>
                            <p className="text-lg font-semibold">{account.metrics.totalCost.toFixed(2)}€</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.isPrimary && account.isConnected && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrimaryAccount(account.id)}
                          className="flex items-center gap-1"
                        >
                          <Crown className="w-4 h-4" />
                          Définir principal
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <Settings className="w-4 h-4" />
                        Détails
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAccount(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      {selectedAccount && (
        <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du compte Google Ads</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informations générales</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Nom:</strong> {selectedAccount.customerName}</p>
                  <p><strong>ID Client:</strong> {selectedAccount.customerId}</p>
                  <p><strong>Statut:</strong> {getStatusBadge(selectedAccount)}</p>
                  <p><strong>Compte principal:</strong> {selectedAccount.isPrimary ? 'Oui' : 'Non'}</p>
                  <p><strong>Connecté le:</strong> {selectedAccount.connectedAt ? new Date(selectedAccount.connectedAt).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Ajouté le:</strong> {new Date(selectedAccount.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedAccount.metrics && (
                <div>
                  <h3 className="font-semibold mb-3">Métriques récentes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Impressions:</span>
                        <span className="font-medium">{selectedAccount.metrics.totalImpressions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clics:</span>
                        <span className="font-medium">{selectedAccount.metrics.totalClicks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CTR moyen:</span>
                        <span className="font-medium">{selectedAccount.metrics.averageCtr.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CPC moyen:</span>
                        <span className="font-medium">{selectedAccount.metrics.averageCpc.toFixed(2)}€</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversions:</span>
                        <span className="font-medium">{selectedAccount.metrics.totalConversions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">CPA moyen:</span>
                        <span className="font-medium">{selectedAccount.metrics.averageCpa.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">ROAS moyen:</span>
                        <span className="font-medium">{selectedAccount.metrics.averageRoas.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coût total:</span>
                        <span className="font-medium">{selectedAccount.metrics.totalCost.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                {!selectedAccount.isPrimary && selectedAccount.isConnected && (
                  <Button
                    onClick={() => {
                      setPrimaryAccount(selectedAccount.id)
                      setSelectedAccount(null)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Définir comme principal
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedAccount(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 