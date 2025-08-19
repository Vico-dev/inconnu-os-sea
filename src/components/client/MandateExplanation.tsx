'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Shield, FileText, Clock } from 'lucide-react'

export default function MandateExplanation() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5" />
          Qu'est-ce qu'un mandat publicitaire ?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Protection juridique</h4>
              <p className="text-sm text-blue-700">
                Le mandat vous protège en définissant clairement les responsabilités de l'agence et vos obligations.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Autorisation légale</h4>
              <p className="text-sm text-blue-700">
                Il autorise l'agence à gérer vos campagnes Google Ads en votre nom et à engager des dépenses publicitaires.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900">Durée limitée</h4>
              <p className="text-sm text-blue-700">
                Valable un an, il doit être renouvelé annuellement pour maintenir les services de publicité.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Pourquoi est-il obligatoire ?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Conformité légale :</strong> Respect des réglementations publicitaires françaises</li>
            <li>• <strong>Transparence :</strong> Définition claire des budgets et objectifs</li>
            <li>• <strong>Sécurité :</strong> Protection des deux parties en cas de litige</li>
            <li>• <strong>Professionnalisme :</strong> Engagement formel de l'agence sur ses prestations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 