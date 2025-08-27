"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Star, 
  BarChart3,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Menu,
  X,
  Search,
  Target,
  Activity,
  CheckCircle,
  TrendingUp,
  Shield,
  Users,
  Building2
} from "lucide-react"
import Link from "next/link"
import ContactForm from "@/components/ContactForm"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const methodology = [
    {
      step: 1,
      title: "Analyse stratégique des données existantes",
      description: "Audit approfondi de vos campagnes Google Ads, performances Shopping, flux produits et cannibalisation SEO/SEA.",
      objective: "Identifier les leviers de croissance et les opportunités d'optimisation.",
      icon: Search,
      color: "blue"
    },
    {
      step: 2,
      title: "Structuration pilotable et scalable",
      description: "Architecture de campagnes optimisée pour une lecture ROAS claire et un pilotage précis.",
      objective: "Créer une structure actionnable et mesurable.",
      icon: Target,
      color: "indigo"
    },
    {
      step: 3,
      title: "Optimisation continue via Inconnu OS",
      description: "Plateforme propriétaire de monitoring et d'optimisation en temps réel.",
      objective: "Maximiser la performance de chaque euro investi.",
      icon: Activity,
      color: "green"
    },
    {
      step: 4,
      title: "Reporting stratégique et arbitrages",
      description: "Dashboard exécutif avec recommandations prioritaires et suivi de l'incrément.",
      objective: "Piloter la rentabilité globale de vos investissements SEA.",
      icon: BarChart3,
      color: "purple"
    }
  ]

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Marketing",
      company: "Groupe Cosmétique International",
      content: "L'approche data-driven d'Agence Inconnu nous a permis d'augmenter notre ROAS de 35% en 3 mois. La transparence et l'expertise technique font toute la différence.",
      rating: 5,
      avatar: "MD",
      results: "+35% ROAS"
    },
    {
      name: "Thomas Martin",
      role: "Directeur Général",
      company: "TechCorp Solutions",
      content: "En tant qu'entreprise en forte croissance, nous avions besoin d'efficacité et de scalabilité. Agence Inconnu nous a fourni les deux, avec un suivi en temps réel.",
      rating: 5,
      avatar: "TM",
      results: "-30% Coût acquisition"
    },
    {
      name: "Sophie Laurent",
      role: "Directrice E-commerce",
      company: "Mode & Style Group",
      content: "L'audit initial nous a révélé des opportunités cachées. Depuis, nos campagnes sont optimisées en continu et nos résultats s'améliorent constamment.",
      rating: 5,
      avatar: "SL",
      results: "+40% CA SEA"
    }
  ]

  return (
          <div className="min-h-screen bg-white">
        {/* Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-blue-100' : 'bg-transparent'
        }`}>
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xs">AI</span>
                  </div>
                </div>
                <span className="text-xl font-semibold text-blue-900">
                  Agence Inconnu
                </span>
              </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#methodology" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">
                Méthodologie
              </a>
              <a href="#results" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">
                Résultats
              </a>
              <a href="#contact" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">
                Contact
              </a>
            </nav>

            {/* CTA Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-900 hover:bg-blue-50">
                  Connexion
                </Button>
              </Link>
              <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                  Audit gratuit
                </Button>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-blue-600" />
              ) : (
                <Menu className="w-5 h-5 text-blue-600" />
              )}
            </button>
          </div>
          </div>
 
           {/* Mobile menu */}
           {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-blue-100 py-4">
              <nav className="flex flex-col space-y-4 px-4">
                <a href="#methodology" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">Méthodologie</a>
                <a href="#results" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">Résultats</a>
                <a href="#contact" className="text-blue-600 hover:text-blue-900 transition-colors font-medium">Contact</a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-blue-100">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-900">
                      Connexion
                    </Button>
                  </Link>
                  <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                      Audit gratuit
                    </Button>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm text-blue-700 mb-6">
                <Building2 className="w-4 h-4" />
                <span>Expert Google Ads & SEA</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-8 leading-tight">
              Arrêtez de gaspiller votre budget Google Ads
            </h1>
            
            <p className="text-xl text-blue-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              <strong className="text-blue-900">80% des entreprises perdent de l&apos;argent sur Google Ads</strong> à cause d&apos;une gestion inefficace.
              <br /><br />
              Nous transformons vos campagnes en véritables machines à générer du CA avec une approche data-driven qui garantit un ROAS positif.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12 max-w-3xl mx-auto">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-blue-900">Audit gratuit de 30 minutes</span>
              </div>
              <p className="text-blue-700">
                Découvrez en 30 minutes exactement pourquoi vos campagnes ne convertissent pas et comment nous pouvons les optimiser pour <strong>doubler votre ROAS</strong>.
              </p>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3">
                  <BarChart3 className="mr-3 w-5 h-5" />
                  Obtenir mon audit gratuit
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </a>
              <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3">
                  <Calendar className="mr-3 w-5 h-5" />
                  Voir un exemple de résultats
                </Button>
              </a>
            </div>

            {/* Métriques */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 mb-2">+40%</div>
                <div className="text-sm text-blue-700">ROAS moyen</div>
                <div className="text-xs text-blue-600 mt-1">en 3 mois</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 mb-2">-30%</div>
                <div className="text-sm text-blue-700">Coût acquisition</div>
                <div className="text-xs text-blue-600 mt-1">en moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900 mb-2">24/7</div>
                <div className="text-sm text-blue-700">Optimisation</div>
                <div className="text-xs text-blue-600 mt-1">automatisée</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Méthodologie */}
      <section id="methodology" className="py-24 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full text-sm text-blue-700 mb-6">
              <Shield className="w-4 h-4" />
              <span>Méthodologie éprouvée</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-blue-900 mb-6">
              Notre approche unique
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto leading-relaxed">
              Contrairement aux agences traditionnelles, nous utilisons une méthodologie data-driven qui garantit des résultats mesurables et durables.
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8 items-stretch">
              {methodology.map((step) => (
                <div key={step.step} className="group h-full">
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border border-blue-100 h-full flex flex-col">
                    {/* Numéro avec gradient */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                      {step.step}
                    </div>

                    {/* Icône */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-blue-700" />
                    </div>

                    {/* Titre */}
                    <h3 className="text-xl font-bold text-blue-900 mb-4 leading-tight">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-blue-700 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Push the objectif to bottom */}
                    <div className="mt-auto">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-800">
                          <span className="text-blue-600">→</span> {step.objective}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

            {/* CTA intégré */}
            <div className="mt-20 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold text-blue-900 mb-4">
                  Prêt à transformer vos campagnes ?
                </h3>
                <p className="text-lg text-blue-700 mb-8 max-w-2xl mx-auto">
                  Rejoignez les entreprises qui ont déjà doublé leur ROAS en 3 mois grâce à notre approche.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-xl shadow-lg">
                      <BarChart3 className="mr-3 w-5 h-5" />
                      Obtenir mon audit gratuit
                      <ArrowRight className="ml-3 w-5 h-5" />
                    </Button>
                  </a>
                  <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl">
                      <Calendar className="mr-3 w-5 h-5" />
                      Voir nos résultats
                    </Button>
                  </a>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="results" className="py-24 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-6">
              Résultats concrets
            </h2>
            <p className="text-lg text-blue-700">
              Ce que disent nos clients de notre collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {testimonial.results}
                    </Badge>
                  </div>
                  
                  <p className="text-blue-700 mb-8 italic leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">{testimonial.name}</h4>
                      <p className="text-blue-700 text-sm">{testimonial.role}</p>
                      <p className="text-blue-600 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulaire de contact */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">Discutons de vos objectifs</h2>
            <p className="text-blue-700">Laissez-nous vos coordonnées, nous revenons vers vous sous 24h ouvrées.</p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* CTA Final */}
      <section id="contact" className="py-24 bg-blue-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Arrêtez de perdre de l&apos;argent sur Google Ads
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            En 30 minutes, découvrez exactement pourquoi vos campagnes ne convertissent pas et comment nous pouvons les optimiser pour doubler votre ROAS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3">
                <BarChart3 className="mr-3 w-5 h-5" />
                Audit gratuit de vos campagnes
              </Button>
            </a>
            <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3">
                <Calendar className="mr-3 w-5 h-5" />
                Appel d&apos;analyse (30 min)
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-blue-900 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                </div>
                <span className="text-xl font-semibold">Agence Inconnu</span>
              </div>
              <p className="text-blue-200 mb-6 leading-relaxed">
                Vos données sont protégées et 100% confidentielles (RGPD)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Services</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors">Audit Google Ads</li>
                <li className="hover:text-white transition-colors">Gestion de campagnes</li>
                <li className="hover:text-white transition-colors">Optimisation continue</li>
                <li className="hover:text-white transition-colors">Formation équipes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center space-x-3 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>contact@agence-inconnu.fr</span>
                </li>
                <li className="flex items-center space-x-3 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>07 81 99 67 15</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6">Légal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Agence Inconnu. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
