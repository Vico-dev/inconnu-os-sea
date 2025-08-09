"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, Users, Zap, ArrowRight, Mail, Phone, MapPin } from "lucide-react"
import ContactForm from "@/components/ContactForm"

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
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-900 to-blue-500 text-white border-0">
            ✔ Certifié Google Partner
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent mb-6">
            Freelance SEA & Consultant Google Ads
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Freelance SEA & consultant Google Ads pour e‑commerce et B2B. Optimisation data‑driven, sans engagement, démarrage en 48h.
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
            <Link href="/#contact">
              <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white border-0">
                Parlons de votre présence en ligne <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/client/subscribe?plan=MEDIUM_BUDGET">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white">
                S’abonner (sans engagement)
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">Sans engagement • Paiement Stripe sécurisé • Démarrage en 48h</p>
        </div>
      </section>

      {/* Positionnement SEA */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Freelance SEA, Consultant Google Ads & Agence SEA — même exigence de performance</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Audit & Refonte</h3>
              <p className="text-gray-600 text-sm">Structure campagnes, mots‑clés, enchères et annonces optimisés pour capter le bon trafic et réduire le CPA.</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Optimisation continue</h3>
              <p className="text-gray-600 text-sm">Tests A/B annonces et pages, ajustements d’enchères, audiences, requêtes de recherche — focus ROAS.</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Reporting clair</h3>
              <p className="text-gray-600 text-sm">Tableaux de bord lisibles, actions priorisées et rendez‑vous réguliers pour scaler ce qui marche.</p>
            </div>
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Le problème</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">Les mêmes freins reviennent souvent. Voici ceux que nous éliminons en priorité.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { title: "Budget gaspillé", desc: "Dépenses qui ne génèrent pas de ventes. CPC élevés, mots‑clés non qualifiés.", icon: Zap },
            { title: "Suivi flou", desc: "Rapports illisibles, pas de vision claire sur ce qui fonctionne vraiment.", icon: TrendingUp },
            { title: "Manque de temps", desc: "Vous ne pouvez pas tout gérer. Google Ads demande une itération quotidienne.", icon: Users },
            { title: "Manque de compétences", desc: "Optimiser structure, enchères, requêtes et annonces n’est pas votre cœur de métier.", icon: CheckCircle },
            { title: "Mauvaises expériences", desc: "Promesses non tenues, résultats décevants. Vous voulez du concret et mesurable.", icon: CheckCircle },
            { title: "Site inefficace", desc: "Trafic qui n’achète pas. Pages et messages non alignés avec l’intention de recherche.", icon: CheckCircle }
          ].map((item, i) => (
            <div key={i} className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="#contact">
            <Button variant="outline" className="px-6">Parler à un consultant</Button>
          </Link>
          <p className="text-xs text-gray-500 mt-2">Sans engagement • Analyse personnalisée</p>
        </div>
      </section>

      {/* Nos Offres */}
      <section id="offres" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Forfaits</h2>
            <p className="text-gray-600">Choisissez le forfait qui correspond à votre budget média.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Petit Chasseur */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Petit Chasseur</h3>
              </div>
              <p className="text-gray-600 mb-4">Pour budget média &lt; 1000€/mois</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">200€</span>
                <span className="text-gray-600">/mois HT</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Audit mensuel</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Optimisations techniques</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Recommandations stratégiques</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Reporting mensuel</li>
              </ul>
              <Link href="/client/subscribe?plan=SMALL_BUDGET">
                <Button className="w-full">Souscrire</Button>
              </Link>
            </div>

            {/* Chasseur */}
            <div className="bg-white p-8 rounded-lg shadow-sm border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Recommandé</Badge>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Chasseur</h3>
              </div>
              <p className="text-gray-600 mb-4">Budget média 1000€–5000€/mois</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">400€</span>
                <span className="text-gray-600">/mois HT</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Optimisations quotidiennes</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Support prioritaire</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Reporting détaillé</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Tests A/B & stratégie</li>
              </ul>
              <Link href="/client/subscribe?plan=MEDIUM_BUDGET">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Souscrire</Button>
              </Link>
            </div>

            {/* Grand Chasseur */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold">Grand Chasseur</h3>
              </div>
              <p className="text-gray-600 mb-4">Budget média 5000€–10000€/mois</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">600€</span>
                <span className="text-gray-600">/mois HT</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Account manager dédié</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Support 24/7</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Stratégie personnalisée</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Analytics avancées</li>
              </ul>
              <Link href="/client/subscribe?plan=LARGE_BUDGET">
                <Button className="w-full">Souscrire</Button>
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

      {/* Section Contact */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-500 bg-clip-text text-transparent mb-4">
              Contactez-nous
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Prêt à transformer vos campagnes Google Ads ? Parlons de votre projet et découvrez comment nous pouvons vous aider à maximiser votre ROI.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Informations de contact */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  Parlons de votre projet
                </h3>
                <p className="text-gray-600 mb-8">
                  Expert freelance certifié Google Partner, je vous accompagne dans l&apos;optimisation de vos campagnes publicitaires pour maximiser votre retour sur investissement.
                </p>
              </div>

              <div className="space-y-6">
                                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg flex items-center justify-center">
                     <Mail className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900">Email</h4>
                     <p className="text-gray-600">contact@agence-inconnu.fr</p>
                   </div>
                 </div>

                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg flex items-center justify-center">
                     <Phone className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900">Téléphone</h4>
                     <p className="text-gray-600">Disponible sur rendez-vous</p>
                   </div>
                 </div>

                 <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg flex items-center justify-center">
                     <MapPin className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h4 className="font-semibold text-gray-900">Adresse</h4>
                     <p className="text-gray-600">74 Avenue générale de Gaulle<br />72000 LE MANS</p>
                   </div>
                 </div>
              </div>

                             <div className="bg-gradient-to-r from-blue-900 to-blue-500 rounded-lg p-6 text-white">
                <h4 className="font-semibold mb-2">Pourquoi nous choisir ?</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Audit gratuit sans engagement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Transparence totale
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Expert certifié Google Partner
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accompagnement personnalisé
                  </li>
                </ul>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div>
              <ContactForm />
            </div>
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
              <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
              <Link href="/mentions-legales" className="hover:text-white transition-colors">Politique de confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
