'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface MandateLegalTermsProps {
  onTermsAccepted: (accepted: boolean) => void
  onGdprAccepted: (accepted: boolean) => void
  termsAccepted: boolean
  gdprAccepted: boolean
}

export default function MandateLegalTerms({
  onTermsAccepted,
  onGdprAccepted,
  termsAccepted,
  gdprAccepted
}: MandateLegalTermsProps) {
  const [showFullTerms, setShowFullTerms] = useState(false)

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Conditions légales du mandat publicitaire
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aperçu des conditions */}
        {!showFullTerms && (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              En signant ce mandat, vous autorisez l'Agence Inconnu à gérer vos campagnes publicitaires en ligne 
              pour une durée d'un an, conformément aux conditions détaillées ci-dessous.
            </p>
            <button
              onClick={() => setShowFullTerms(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Lire les conditions complètes →
            </button>
          </div>
        )}

        {/* Conditions complètes */}
        {showFullTerms && (
          <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            <div className="space-y-4 text-sm text-gray-700">
              <h4 className="font-semibold text-gray-900">1. OBJET DU MANDAT</h4>
              <p>
                Le présent mandat autorise l'Agence Inconnu, société spécialisée en publicité en ligne, 
                à gérer les campagnes publicitaires Google Ads du client pour une durée d'un an à compter de la signature.
              </p>

              <h4 className="font-semibold text-gray-900">2. OBLIGATIONS DE L'AGENCE</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gestion optimisée des campagnes publicitaires</li>
                <li>Suivi des performances et reporting mensuel</li>
                <li>Respect du budget alloué</li>
                <li>Conformité aux règles Google Ads</li>
                <li>Confidentialité des données client</li>
              </ul>

              <h4 className="font-semibold text-gray-900">3. OBLIGATIONS DU CLIENT</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Fourniture des informations nécessaires</li>
                <li>Validation des créatifs publicitaires</li>
                <li>Paiement des frais d'agence selon devis</li>
                <li>Respect des délais de validation</li>
              </ul>

              <h4 className="font-semibold text-gray-900">4. DURÉE ET RENOUVELLEMENT</h4>
              <p>
                Le mandat est valable pour une durée d'un an. Le renouvellement annuel est obligatoire 
                pour maintenir les services. Un rappel sera envoyé 30 jours avant l'expiration.
              </p>

              <h4 className="font-semibold text-gray-900">5. RÉSILIATION</h4>
              <p>
                Chaque partie peut résilier le mandat avec un préavis de 30 jours par lettre recommandée 
                avec accusé de réception.
              </p>

              <h4 className="font-semibold text-gray-900">6. DROIT APPLICABLE</h4>
              <p>
                Le présent mandat est soumis au droit français. En cas de litige, les tribunaux français 
                sont seuls compétents.
              </p>

              <h4 className="font-semibold text-gray-900">7. PROTECTION DES DONNÉES (RGPD)</h4>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vos données 
                personnelles sont collectées et traitées pour la gestion de ce mandat publicitaire.
              </p>
              <p>
                <strong>Responsable de traitement :</strong> Agence Inconnu<br/>
                <strong>Finalité :</strong> Gestion du mandat publicitaire et des campagnes<br/>
                <strong>Base légale :</strong> Exécution du contrat<br/>
                <strong>Conservation :</strong> 3 ans après la fin du mandat<br/>
                <strong>Vos droits :</strong> Accès, rectification, suppression, portabilité, opposition
              </p>
            </div>
          </div>
        )}

        {/* Cases à cocher */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => onTermsAccepted(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm font-medium">
              J'ai lu, compris et j'accepte les conditions du mandat publicitaire *
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="gdpr"
              checked={gdprAccepted}
              onCheckedChange={(checked) => onGdprAccepted(checked as boolean)}
              required
            />
            <Label htmlFor="gdpr" className="text-sm font-medium">
              J'accepte le traitement de mes données personnelles conformément au RGPD *
            </Label>
          </div>

          <p className="text-xs text-gray-500">
            * Champs obligatoires. Votre consentement est nécessaire pour la signature électronique de ce mandat.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 