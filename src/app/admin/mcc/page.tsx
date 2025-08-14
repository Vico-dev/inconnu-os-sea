'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ExternalLink, Link, Unlink, RefreshCw, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { ClientSelectionModal } from '@/components/admin/ClientSelectionModal'

interface MCCAccount {
  customerId: string
  customerName: string
  manager: boolean
  testAccount: boolean
  isLinked: boolean
  linkedClientId?: string
  linkedClientName?: string
}

export default function MCCPage() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accounts, setAccounts] = useState<MCCAccount[]>([])
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<MCCAccount | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [isConfiguringCustomer, setIsConfiguringCustomer] = useState(false)
  const [needsCustomerConfig, setNeedsCustomerConfig] = useState(false)

  // Vérifier la connexion MCC
  useEffect(() => {
    checkMCCConnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkMCCConnection = async () => {
    try {
      const response = await fetch('/api/admin/mcc/accounts')
      if (response.ok) {
        const data = await response.json()
        setIsConnected(true)
        // Vérifier si on a un customer ID temporaire qui nécessite une configuration
        if (data.accounts?.[0]?.customerId === '0000000000') {
          setNeedsCustomerConfig(true)
        }
        loadAccounts()
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadAccounts = async () => {
    setIsLoadingAccounts(true)
    try {
      const response = await fetch('/api/admin/mcc/accounts')
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      } else {
        toast.error('Erreur lors du chargement des comptes')
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des comptes')
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const connectMCC = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/admin/mcc/auth')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        toast.error('Erreur lors de la connexion MCC')
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion MCC')
    } finally {
      setIsConnecting(false)
    }
  }

  const linkAccount = async (account: MCCAccount) => {
    setSelectedAccount(account)
    setIsModalOpen(true)
  }

  const handleClientSelection = async (clientId: string) => {
    if (!selectedAccount) return

    try {
      const response = await fetch('/api/admin/mcc/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: selectedAccount.customerId, 
          clientId 
        })
      })

      if (response.ok) {
        toast.success('Compte lié avec succès')
        loadAccounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la liaison')
      }
    } catch (error) {
      toast.error('Erreur lors de la liaison')
    }
  }

  const unlinkAccount = async (customerId: string) => {
    try {
      const response = await fetch('/api/admin/mcc/unlink-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      })

      if (response.ok) {
        toast.success('Compte délié avec succès')
        loadAccounts()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la déliaison')
      }
    } catch (error) {
      toast.error('Erreur lors de la déliaison')
    }
  }

  const configureCustomerId = async () => {
    if (!customerId.trim()) {
      toast.error('Veuillez saisir un Customer ID')
      return
    }

    setIsConfiguringCustomer(true)
    try {
      const response = await fetch('/api/admin/mcc/configure-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Customer ID configuré : ${data.customerName || data.customerId}`)
        setNeedsCustomerConfig(false)
        setCustomerId('')
        loadAccounts()
      } else {
        toast.error(data.error || 'Erreur lors de la configuration')
      }
    } catch (error) {
      toast.error('Erreur lors de la configuration du Customer ID')
    } finally {
      setIsConfiguringCustomer(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion MCC Google Ads</h1>
          <p className="text-muted-foreground">
            Gérez les comptes clients de votre Manager Account
          </p>
        </div>
        <div className="flex gap-2">
          {isConnected && (
            <Button onClick={loadAccounts} disabled={isLoadingAccounts}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          )}
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connexion MCC requise</CardTitle>
            <CardDescription>
              Connectez votre compte Google Ads Manager pour gérer les comptes clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectMCC} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Se connecter à Google Ads
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {needsCustomerConfig ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration du Customer ID
                </CardTitle>
                <CardDescription>
                  Veuillez saisir votre Customer ID Google Ads MCC pour terminer la configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID MCC</Label>
                  <Input
                    id="customerId"
                    placeholder="Ex: 123-456-7890 ou 1234567890"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez trouver votre Customer ID dans votre compte Google Ads, en haut à droite de l&apos;interface.
                  </p>
                </div>
                <Button 
                  onClick={configureCustomerId} 
                  disabled={isConfiguringCustomer || !customerId.trim()}
                >
                  {isConfiguringCustomer ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Configurer Customer ID
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                ✅ Connexion MCC établie. Vous pouvez maintenant gérer les comptes clients.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Comptes clients ({accounts.length})</CardTitle>
              <CardDescription>
                Liste des comptes Google Ads dans votre Manager Account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : accounts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun compte trouvé
                </p>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div
                      key={account.customerId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{account.customerName}</h3>
                          <Badge variant="secondary">ID: {account.customerId}</Badge>
                          {account.manager && (
                            <Badge variant="outline">Manager</Badge>
                          )}
                          {account.testAccount && (
                            <Badge variant="destructive">Test</Badge>
                          )}
                        </div>
                        {account.isLinked && account.linkedClientName && (
                          <p className="text-sm text-muted-foreground">
                            Lié à: {account.linkedClientName}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {account.isLinked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unlinkAccount(account.customerId)}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Délier
                          </Button>
                                                 ) : (
                           <Button
                             size="sm"
                             onClick={() => linkAccount(account)}
                           >
                             <Link className="h-4 w-4 mr-2" />
                             Lier
                           </Button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de sélection de client */}
      {selectedAccount && (
        <ClientSelectionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedAccount(null)
          }}
          onSelect={handleClientSelection}
          customerId={selectedAccount.customerId}
          customerName={selectedAccount.customerName}
        />
      )}
    </div>
  )
} 