'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, User, Building } from 'lucide-react'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  clientAccount?: {
    id: string
    company: {
      name: string
    }
  }
}

interface ClientSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (clientId: string) => void
  customerId: string
  customerName: string
}

export function ClientSelectionModal({
  isOpen,
  onClose,
  onSelect,
  customerId,
  customerName
}: ClientSelectionModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadClients()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientAccount?.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchTerm, clients])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users?role=CLIENT')
      if (response.ok) {
        const data = await response.json()
        setClients(data.users || [])
        setFilteredClients(data.users || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (clientId: string) => {
    onSelect(clientId)
    onClose()
    setSearchTerm('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Lier le compte MCC à un client</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez le client à lier au compte <strong>{customerName}</strong> (ID: {customerId})
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Liste des clients */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelect(client.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {client.firstName} {client.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {client.email}
                          </div>
                          {client.clientAccount?.company.name && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {client.clientAccount.company.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">Client</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 