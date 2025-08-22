"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Building2, 
  User, 
  Mail, 
  Euro,
  Check
} from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  company: string
  budget: number
  accountManager?: string
}

interface ClientSelectorProps {
  clients: Client[]
  selectedClient: Client | null
  onClientSelect: (client: Client | null) => void
}

export function ClientSelector({ clients, selectedClient, onClientSelect }: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client sélectionné */}
      {selectedClient && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedClient.company}</h3>
                  <p className="text-sm text-muted-foreground">{selectedClient.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{selectedClient.budget}€/mois</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClientSelect(null)}
                >
                  Changer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des clients */}
      {!selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onClientSelect(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{client.company}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {client.name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {client.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="flex items-center">
                      <Euro className="w-3 h-3 mr-1" />
                      {client.budget}€/mois
                    </Badge>
                    {client.accountManager && (
                      <p className="text-xs text-muted-foreground mt-1">
                        AM: {client.accountManager}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Message si aucun client */}
      {!selectedClient && filteredClients.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Aucun client trouvé" : "Aucun client disponible"}
          </p>
        </div>
      )}
    </div>
  )
} 