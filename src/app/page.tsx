"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Users, Zap, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Agence Inconnu</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-600 hover:text-blue-600 transition-colors">
              Accueil
            </a>
            <a href="#expertise" className="text-gray-600 hover:text-blue-600 transition-colors">
              Expertise
            </a>
            <a href="#offres" className="text-gray-600 hover:text-blue-600 transition-colors">
              Offres
            </a>
            <a href="#tarifs" className="text-gray-600 hover:text-blue-600 transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
              FAQ
            </a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </a>
            <Link href="/login">
              <Button variant="outline" size="sm">Se connecter</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            ✔ Certifié Google Partner
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transformez vos campagnes Google Ads en machine à convertir
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Expert freelance certifié Google Partner. Optimisez vos campagnes publicitaires et maximisez votre ROI avec un accompagnement personnalisé.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.2x</div>
              <div className="text-gray-600">ROAS moyen</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">+150</div>
              <div className="text-gray-600">Entreprises accompagnées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">-40%</div>
              <div className="text-gray-600">Coût par acquisition</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Réserver un audit gratuit <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#offres">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Découvrir notre méthode
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ils nous font confiance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Ils nous font confiance</h2>
          <div className="flex justify-center space-x-4">
            <div className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">E-commerce</div>
            <div className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">SaaS</div>
            <div className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">PME</div>
            <div className="px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">Startup</div>
          </div>
        </div>
      </section>

      {/* Logos Google */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-gray-400 text-sm font-semibold">Google Analytics</div>
            <div className="text-gray-400 text-sm font-semibold">Google Tag Manager</div>
            <div className="text-gray-400 text-sm font-semibold">Google Ads</div>
            <div className="text-gray-400 text-sm font-semibold">Google Analytics</div>
            <div className="text-gray-400 text-sm font-semibold">Google Tag Manager</div>
            <div className="text-gray-400 text-sm font-semibold">Google</div>
          </div>
        </div>
      </section>

      {/* Le problème */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Le problème
          </h2>
          <p className="text-xl text-gray-600">
            Les entreprises qui nous contactent partagent souvent les mêmes défis. Des difficultés récurrentes que nous connaissons parfaitement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Budget gaspillé</h3>
            <p className="text-gray-600">
              Vous investissez déjà sur Google sans voir de retour concret. L&apos;argent part sans résultats visibles.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Suivi flou</h3>
            <p className="text-gray-600">
              Des rapports compliqués, vous n&apos;avez aucune idée de ce qui fonctionne vraiment dans vos campagnes.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Manque de temps</h3>
            <p className="text-gray-600">
              Vous n&apos;avez ni le temps, ni l&apos;envie de gérer tout ça vous-même. C&apos;est complexe et chronophage.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Manque de compétences</h3>
            <p className="text-gray-600">
              Ce n&apos;est pas votre métier, vous ne savez pas comment optimiser vos campagnes efficacement.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Mauvaises expériences</h3>
            <p className="text-gray-600">
              Vous avez été déçu par des promesses non tenues dans le passé. Vous voulez des résultats concrets.
            </p>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-3">Site inefficace</h3>
            <p className="text-gray-600">
              Votre site est joli mais n&apos;apporte pas de clients. Il semble invisible sur Google.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Obtenir mon audit gratuit
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-2">
            Sans engagement. Analyse personnalisée de votre situation.
          </p>
        </div>
      </section>

      {/* Nos Offres */}
      <section id="offres" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Offres
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Accompagnement Mensuel</h3>
              <p className="text-gray-600 mb-6">
                Un call mensuel pour optimiser vos campagnes et ajuster votre stratégie selon vos résultats.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Audit mensuel de vos performances
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Optimisations techniques
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Recommandations stratégiques
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Reporting détaillé
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Commencer maintenant</Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Recommandé</Badge>
              </div>
              <h3 className="text-xl font-semibold mb-4">Accompagnement Quotidien</h3>
              <p className="text-gray-600 mb-6">
                Un suivi quotidien de vos campagnes avec optimisations en temps réel et support prioritaire.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Optimisations quotidiennes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Support prioritaire
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Reporting en temps réel
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Stratégie personnalisée
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Commencer maintenant</Button>
              </Link>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Formation Complète</h3>
              <p className="text-gray-600 mb-6">
                Apprenez à gérer vos campagnes Google Ads de A à Z avec notre formation personnalisée.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Formation sur mesure
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Support post-formation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Ressources exclusives
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Certification incluse
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full">Commencer maintenant</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Avantages */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-xl text-gray-600">
            Notre approche unique combine expertise technique et accompagnement personnalisé.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Résultats garantis</h3>
            <p className="text-gray-600">
              Nous nous engageons sur des résultats concrets. Amélioration du ROAS et réduction des coûts.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Expertise technique</h3>
            <p className="text-gray-600">
              Certifié Google Partner avec plus de 5 ans d&apos;expérience en optimisation de campagnes.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Transparence totale</h3>
            <p className="text-gray-600">
              Accès complet à vos données et rapports détaillés. Vous savez exactement ce qui se passe.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-3">Support dédié</h3>
            <p className="text-gray-600">
              Accompagnement personnalisé avec un expert dédié. Réactivité garantie et suivi transparent.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à transformer vos campagnes ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez nos clients qui ont déjà multiplié leur ROAS par 4.2x en moyenne.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="text-center text-blue-100">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm">Audit gratuit sans engagement</div>
            </div>
            <div className="text-center text-blue-100">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm">Résultats dès la première semaine</div>
            </div>
            <div className="text-center text-blue-100">
              <div className="text-2xl font-bold">✓</div>
              <div className="text-sm">Expert certifié Google Partner</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Réserver mon audit gratuit
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold">Agence Inconnu</span>
              </div>
              <p className="text-gray-400 mb-4">
                Expert freelance en Google Ads et SEA. Optimisez vos campagnes publicitaires et maximisez votre ROI avec un accompagnement personnalisé.
              </p>
              <Link href="/register">
                <Button variant="outline" size="sm">
                  Réserver un appel
                </Button>
              </Link>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Google Ads</li>
                <li>SA360</li>
                <li>Analytics</li>
                <li>GTM</li>
                <li>Google Merchant</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Liens utiles</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/client" className="hover:text-white transition-colors">Espace client</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">S&apos;inscrire</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>74 Avenue générale de Gaulle, 72000 LE MANS</p>
                <p>contact@agence-inconnu.fr</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 Agence Inconnu. Tous droits réservés.
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">CGV</a>
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
