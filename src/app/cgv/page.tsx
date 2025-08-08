import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CGVPage() {
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
              Conditions Générales de Vente
            </h1>
            <p className="text-xl text-gray-600">
              CGV - Agence Inconnu
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* En-tête */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                AGENCE INCONNU
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>SARL au capital de 500 euros</strong>
                </p>
                <p className="text-gray-700">
                  <strong>Siège social :</strong> 42 Rue Bob Wollek, France
                </p>
                <p className="text-gray-700">
                  <strong>RCS :</strong> Le Mans B 910 400 886
                </p>
                <p className="text-gray-700 text-sm mt-4">
                  <strong>Version en vigueur au 8 août 2025</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 1. Définitions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                1. Définitions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Agence :</strong> Désigne la société AGENCE INCONNU.
                </p>
                <p className="text-gray-700">
                  <strong>Client :</strong> Toute personne morale ou physique ayant souscrit un abonnement aux Services.
                </p>
                <p className="text-gray-700">
                  <strong>Services :</strong> Prestations d'accompagnement SEA fournies par l'Agence dans le cadre d'un abonnement mensuel.
                </p>
                <p className="text-gray-700">
                  <strong>Contrat :</strong> Ensemble contractuel constitué des présentes CGV, de tout devis signé ou validation électronique.
                </p>
                <p className="text-gray-700">
                  <strong>Abonnement :</strong> Engagement mensuel du Client, reconductible tacitement, pour la fourniture des Services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Objet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                2. Objet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Les présentes CGV définissent les conditions contractuelles applicables à la fourniture des Services par l'Agence, sous forme d'abonnement mensuel.
              </p>
            </CardContent>
          </Card>

          {/* 3. Commande et Conclusion du Contrat */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                3. Commande et Conclusion du Contrat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                La souscription aux Services s'effectue via validation électronique ou signature d'un devis. Toute souscription implique l'acceptation pleine et entière des CGV. L'Abonnement prend effet à la date de confirmation de commande par l'Agence.
              </p>
            </CardContent>
          </Card>

          {/* 4. Durée et Résiliation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                4. Durée et Résiliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'Abonnement est conclu pour une durée mensuelle, reconductible automatiquement.
              </p>
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Résiliation par le Client :</strong> Le Client peut résilier son Abonnement uniquement via son espace client, au moins 7 jours calendaires avant la date de renouvellement. Toute période entamée reste due et ne donne lieu à aucun remboursement.
                </p>
                <p className="text-gray-700">
                  <strong>Résiliation par l'Agence :</strong> L'Agence peut mettre fin à l'Abonnement à tout moment avec un préavis de 7 jours. En cas de manquement grave, la résiliation peut être immédiate.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Prix et Modalités de Paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                5. Prix et Modalités de Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Les prix sont exprimés en euros HT. Le paiement est mensuel, à date fixe, par prélèvement, virement ou carte bancaire.
              </p>
              <p className="text-gray-700">
                Tout retard entraîne l'application de plein droit de pénalités équivalentes à trois (3) fois le taux légal et une indemnité forfaitaire de 40 euros pour frais de recouvrement (art. L441-10 Code de commerce). L'Agence peut suspendre les Services en cas de non-paiement.
              </p>
            </CardContent>
          </Card>

          {/* 6. Exécution des Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                6. Exécution des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                L'Agence exécute les Services selon les pratiques professionnelles en vigueur. Le Client s'engage à fournir tous les accès, données et validations nécessaires. Les délais sont suspendus en cas de retard imputable au Client.
              </p>
            </CardContent>
          </Card>

          {/* 7. Responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                7. Responsabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                L'Agence est soumise à une obligation de moyens. La responsabilité de l'Agence, quelle qu'en soit la nature, est limitée au montant total des sommes effectivement perçues au cours des trois (3) derniers mois précédant l'incident.
              </p>
              <p className="text-gray-700">
                Cette clause ne s'applique pas en cas de faute lourde, dolosive, ou manquement à une obligation essentielle.
              </p>
            </CardContent>
          </Card>

          {/* 8. Propriété Intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                8. Propriété Intellectuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Les livrables fournis restent la propriété de l'Agence jusqu'à règlement complet. Une licence non exclusive et non transférable est accordée au Client pour un usage interne uniquement.
              </p>
            </CardContent>
          </Card>

          {/* 9. Confidentialité et Données Personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                9. Confidentialité et Données Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Chaque partie s'engage à la plus stricte confidentialité. Les données personnelles sont traitées dans le respect du RGPD. Le Client peut exercer ses droits en écrivant à : contact@agence-inconnu.fr
              </p>
            </CardContent>
          </Card>

          {/* 10. Suspension des Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                10. Suspension des Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                L'Agence peut suspendre temporairement l'accès aux Services :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                <li>En cas de non-paiement,</li>
                <li>Pour maintenance ou mise à jour,</li>
                <li>En cas de manquement contractuel du Client.</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Force Majeure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                11. Force Majeure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Aucune des parties ne pourra être tenue responsable en cas d'événement de force majeure au sens de la jurisprudence française.
              </p>
            </CardContent>
          </Card>

          {/* 12. Modification des CGV */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                12. Modification des CGV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                L'Agence se réserve le droit de modifier les CGV. Toute modification sera notifiée au Client et applicable à la prochaine période d'Abonnement.
              </p>
            </CardContent>
          </Card>

          {/* 13. Droit Applicable et Juridiction Compétente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                13. Droit Applicable et Juridiction Compétente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Les présentes CGV sont soumises au droit français. Tout litige sera de la compétence exclusive du Tribunal de commerce du Mans.
              </p>
            </CardContent>
          </Card>

          {/* 14. Divers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                14. Divers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Non-renonciation :</strong> Le fait de ne pas se prévaloir d'un droit ne vaut pas renonciation.
                </p>
                <p className="text-gray-700">
                  <strong>Nullité partielle :</strong> Si une clause est déclarée nulle, les autres dispositions restent valides.
                </p>
                <p className="text-gray-700">
                  <strong>Archivage :</strong> L'Agence conserve les preuves des transactions par tout moyen fiable numériquement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 15. Achat Média et Gestion des Budgets Publicitaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                15. Achat Média et Gestion des Budgets Publicitaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 15.1 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">15.1 Achat média par le Client</h4>
                <p className="text-gray-700 mb-3">
                  Par défaut, l'achat média est réalisé directement par le Client via ses propres comptes publicitaires (Google Ads, Meta Ads, etc.).
                </p>
                <p className="text-gray-700 mb-3">
                  L'Agence agit en tant que prestataire pour la gestion et l'optimisation des campagnes. Le Client reste seul responsable du paiement des régies publicitaires. En aucun cas, l'Agence ne saurait être tenue responsable d'une suspension ou d'un dysfonctionnement lié à un défaut de paiement du Client ou à un non-respect des conditions des régies.
                </p>
              </div>

              {/* 15.2 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">15.2 Achat média réalisé par l'Agence</h4>
                <p className="text-gray-700 mb-3">
                  En cas de retard de paiement lié à l'achat média, des pénalités de retard seront automatiquement appliquées, équivalentes à trois (3) fois le taux d'intérêt légal, ainsi qu'une indemnité forfaitaire de 40 euros pour frais de recouvrement, conformément à l'article L441-10 du Code de commerce.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Un budget média mensuel prévisionnel est défini et validé avec le Client par écrit (devis, email, contrat ou espace client) ;</li>
                  <li>Le Client s'engage à payer ce budget par avance ou à le rembourser sur présentation de facture dans un délai de 7 jours ouvrés ;</li>
                  <li>Les montants engagés font l'objet d'une facturation séparée, incluant des frais de gestion de 15 % calculés sur le montant total dépensé ;</li>
                  <li>L'Agence se réserve le droit de suspendre les campagnes en cas de non-paiement ;</li>
                  <li>L'Agence ne pourra être tenue responsable en cas de refus, blocage ou limitation des régies publicitaires imputables au Client (contenu, site, historique, politique de la régie, etc.).</li>
                </ul>
              </div>

              {/* 15.3 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">15.3 Dépassement du budget média</h4>
                <p className="text-gray-700 mb-3">
                  En cas de dépassement du budget mensuel validé :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Si le dépassement est imputable à une variation externe (hausse CPC, erreurs des régies, etc.), le Client s'engage à rembourser l'intégralité des dépenses réellement engagées ;</li>
                  <li>Si le dépassement résulte d'une erreur de l'Agence, la facturation ne pourra excéder 10 % du budget validé, sauf accord préalable du Client ;</li>
                  <li>Si le dépassement est volontaire (nouveaux formats, ciblages), il doit être validé par écrit ou via l'interface client.</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  L'Agence informera le Client dans les meilleurs délais d'un dépassement prévisible afin de permettre un ajustement concerté.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 