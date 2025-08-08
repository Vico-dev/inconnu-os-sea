import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent mb-4">
              Mentions Légales
            </h1>
            <p className="text-xl text-gray-600">
              Informations légales et contact
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Éditeur */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Éditeur du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Raison sociale :</strong> Agence Inconnu
                </p>
                <p className="text-gray-700">
                  <strong>SIREN :</strong> 910400886
                </p>
                <p className="text-gray-700">
                  <strong>Numéro de TVA intracommunautaire :</strong> FR54910400886
                </p>
                <p className="text-gray-700">
                  <strong>Adresse :</strong> 74 avenue général Leclerc
                </p>
                <p className="text-gray-700">
                  <strong>Email :</strong> contact@agence-inconnu.fr
                </p>
                <p className="text-gray-700">
                  <strong>Téléphone :</strong> 07 81 99 67 15
                </p>
                <p className="text-gray-700">
                  <strong>Directeur de publication :</strong> Victor Soldet
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Hébergement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Hébergeur :</strong> Railway
                </p>
                <p className="text-gray-700">
                  <strong>Site web :</strong> https://railway.app
                </p>
                <p className="text-gray-700">
                  <strong>Adresse :</strong> Railway Corp, 2261 Market Street #5021, San Francisco, CA 94114, États-Unis
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Propriété intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p className="text-gray-700">
                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </CardContent>
          </Card>

          {/* Protection des données */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Protection des données personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), 
                vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
              </p>
              <p className="text-gray-700">
                Pour exercer ces droits, vous pouvez nous contacter à l'adresse email suivante : contact@agence-inconnu.fr
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Ce site utilise des cookies pour améliorer votre expérience de navigation. 
                Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email :</strong> contact@agence-inconnu.fr
                </p>
                <p className="text-gray-700">
                  <strong>Téléphone :</strong> 07 81 99 67 15
                </p>
                <p className="text-gray-700">
                  <strong>Site web :</strong> https://agence-inconnu.fr
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 