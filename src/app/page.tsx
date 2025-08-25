"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Check, 
  Star, 
  TrendingUp, 
  Zap, 
  Brain, 
  Target, 
  BarChart3,
  Users,
  Clock,
  Shield,
  Rocket,
  Search,
  ShoppingCart,
  Settings,
  Eye,
  Calendar,
  Phone,
  Mail,
  Linkedin,
  Github,
  ChevronRight,
  Play,
  Sparkles,
  Award,
  Globe,
  Lightbulb,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const offers = [
    {
      id: "petit-chasseur",
      title: "Petit Chasseur",
      subtitle: "Démarrage & optimisation",
      description: "Pour les budgets média inférieurs à 1000€/mois",
      price: "200€/mois",
      features: [
        "Audit initial complet",
        "Création de 2-3 campagnes",
        "Optimisation mensuelle",
        "Reporting hebdomadaire",
        "Support email uniquement"
      ],
      audience: "Petites entreprises avec budget média < 1000€/mois",
      benefits: ["ROI garanti", "Budget maîtrisé", "Démarrage rapide"],
      cta: "Commencer maintenant",
      popular: false,
      icon: Target
    },
    {
      id: "chasseur",
      title: "Chasseur",
      subtitle: "Gestion complète & performance",
      description: "Pour les budgets média entre 1000€ et 5000€/mois",
      price: "400€/mois",
      features: [
        "Gestion complète des campagnes",
        "Optimisation continue",
        "Rendez-vous mensuel",
        "Reporting détaillé",
        "Accès à Inconnu OS"
      ],
      audience: "Entreprises avec budget média 1000€-5000€/mois",
      benefits: ["ROI optimisé", "Gain de temps", "Expertise dédiée"],
      cta: "Planifier un appel",
      popular: true,
      icon: Rocket
    },
    {
      id: "grand-chasseur",
      title: "Grand Chasseur",
      subtitle: "Gestion premium & assistance 5/7",
      description: "Pour les budgets média supérieurs à 5000€/mois",
      price: "800€/mois",
      features: [
        "Gestion complète des campagnes",
        "Optimisation continue",
        "Reporting hebdomadaire",
        "Assistance 5/7",
        "Support prioritaire"
      ],
      audience: "Entreprises avec budget média > 5000€/mois",
      benefits: ["ROI maximal", "Support premium", "Expertise dédiée"],
      cta: "Planifier un appel",
      popular: false,
      icon: Globe
    }
  ]

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Directrice Marketing",
      company: "Cosmétique Naturelle",
      content: "Grâce à Victor et son outil Inconnu OS, nous avons augmenté notre ROAS de 35% en seulement 3 mois. L'approche technique combinée à l'expertise humaine fait toute la différence.",
      rating: 5,
      avatar: "MD"
    },
    {
      name: "Thomas Martin",
      role: "Fondateur",
      company: "TechStart",
      content: "En tant que startup, nous avions besoin d'efficacité et de transparence. Victor nous a fourni les deux, avec un suivi en temps réel et des optimisations constantes.",
      rating: 5,
      avatar: "TM"
    },
    {
      name: "Sophie Laurent",
      role: "Responsable E-commerce",
      company: "Mode & Style",
      content: "L'audit initial nous a ouvert les yeux sur nos gaspillages. Depuis, nos campagnes sont optimisées en continu et nos résultats ne cessent de s'améliorer.",
      rating: 5,
      avatar: "SL"
    }
  ]

  const methodology = [
    {
      step: 1,
      title: "Analyse & Audit",
      description: "Analyse approfondie de vos besoins et audit de vos campagnes existantes",
      icon: Search
    },
    {
      step: 2,
      title: "Stratégie & Plan",
      description: "Élaboration d'une stratégie personnalisée avec objectifs clairs et KPIs",
      icon: Target
    },
    {
      step: 3,
      title: "Lancement & Pilotage",
      description: "Mise en place et optimisation continue avec Inconnu OS",
      icon: Rocket
    },
    {
      step: 4,
      title: "Suivi & Amélioration",
      description: "Monitoring en temps réel et améliorations continues",
      icon: TrendingUp
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">AI</span>
                </div>
              </div>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">Agence Inconnu</span>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>

            {/* CTA Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Commencer
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors">Services</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-blue-600">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Commencer
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-blue-600/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/3 to-blue-600/5" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo animé */}
            <div className="flex items-center justify-center space-x-3 mb-8 animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">AI</span>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Agence Inconnu
              </div>
            </div>
            
            {/* Titre principal avec animation */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Freelance SEA + IA
              </span>
              <br />
              <span className="text-4xl lg:text-5xl text-gray-600 font-light">
                L'alternative premium aux agences
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in-up delay-200">
              Je pilote vos campagnes Google Ads avec un système intelligent et sur-mesure, 
              pour maximiser votre ROI et éliminer le gaspillage publicitaire.
            </p>
            
            {/* CTAs avec effets */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-10 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="mr-3 w-5 h-5" />
                  Obtenez votre audit gratuit
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
              <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-6 rounded-2xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
                >
                  <Calendar className="mr-3 w-5 h-5" />
                  Réservez un appel découverte
                </Button>
              </a>
            </div>

            {/* Métriques flottantes */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in-up delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">+40%</div>
                <div className="text-sm text-gray-600">ROAS moyen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">-30%</div>
                <div className="text-sm text-gray-600">Coût acquisition</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Optimisation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Pourquoi me choisir */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Pourquoi me choisir ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              L'alliance parfaite entre expertise humaine et technologie de pointe
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Solo, mais pas seul",
                description: "Outil IA propriétaire développé sur-mesure pour automatiser et optimiser",
                color: "blue"
              },
              {
                icon: Target,
                title: "IA + expertise humaine",
                description: "Je pilote, il exécute. La technologie au service de votre stratégie",
                color: "indigo"
              },
              {
                icon: Zap,
                title: "Plus d'agilité",
                description: "Meilleur suivi et plus de réactivité qu'une agence traditionnelle",
                color: "blue"
              },
              {
                icon: TrendingUp,
                title: "Optimisation continue",
                description: "Pilotage au ROAS, pas au volume. Résultats garantis",
                color: "green"
              }
            ].map((item, index) => (
              <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-10 h-10 text-${item.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Présentation Inconnu OS */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                Inconnu OS : votre copilote IA
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Un système interne que j'ai développé pour automatiser et optimiser vos campagnes Google Ads 24h/24.
              </p>
              
              <div className="space-y-6">
                {[
                  "Suivi des campagnes Google Ads",
                  "Scoring produit Shopping (flux GMC)",
                  "Détection d'opportunités SEA",
                  "Priorisation budgétaire",
                  "Reporting en temps réel"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature}</h4>
                      <p className="text-gray-600">Monitoring et optimisation automatisés</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/register">
                <Button className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Découvrir les possibilités
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium opacity-90">ROAS Global</span>
                        <span className="text-3xl font-bold">+35%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full animate-pulse" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium opacity-90">Optimisations</span>
                        <span className="text-3xl font-bold">24/7</span>
                      </div>
                      <div className="flex space-x-2">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-3 h-12 bg-white/30 rounded-full animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium opacity-90">Temps de réponse</span>
                        <span className="text-3xl font-bold">&lt;5min</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 opacity-80" />
                        <span className="text-sm opacity-90">Monitoring continu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Effet de brillance */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Offres */}
      <section id="services" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Nos offres "Chasseur"
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez la formule qui correspond le mieux à vos besoins et objectifs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {offers.map((offer, index) => (
              <Card key={offer.id} className={`relative border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ${
                offer.popular ? 'ring-2 ring-blue-500 scale-105 bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'
              }`}>
                {offer.popular && (
                  <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full shadow-lg">
                    Recommandé
                  </Badge>
                )}
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <offer.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{offer.title}</CardTitle>
                  <p className="text-sm text-blue-600 font-medium mb-2">{offer.subtitle}</p>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <div className="text-3xl font-bold text-blue-600">{offer.price}</div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Ce que ça inclut :</h4>
                      <ul className="space-y-3">
                        {offer.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">À qui ça s'adresse :</h4>
                      <p className="text-sm text-gray-600">{offer.audience}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Bénéfices clés :</h4>
                      <div className="flex flex-wrap gap-2">
                        {offer.benefits.map((benefit, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {offer.cta === "Planifier un appel" ? (
                      <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                        <Button 
                          className={`w-full mt-6 ${
                            offer.popular 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                              : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                          } rounded-2xl py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                        >
                          {offer.cta}
                        </Button>
                      </a>
                    ) : (
                      <Link href="/register">
                        <Button 
                          className={`w-full mt-6 ${
                            offer.popular 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                              : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                          } rounded-2xl py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                        >
                          {offer.cta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Étude de cas */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                Étude de cas – Cosmétique
              </h2>
              <p className="text-xl text-gray-600">
                +35% ROAS global sans surinvestissement
              </p>
            </div>
            
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Approche stratégique SEO + SEA
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Campagne Google Ads retravaillée via une approche SEO + SEA. 
                      Suppression des campagnes marque, étude SEO pour valider la reprise organique, 
                      réallocation budget en Shopping non marque.
                    </p>
                    
                    <div className="space-y-6">
                      {[
                        { icon: TrendingUp, title: "-40% de dépenses inutiles", subtitle: "Optimisation des budgets gaspillés", color: "red" },
                        { icon: ShoppingCart, title: "+300% de perf Shopping non-marque", subtitle: "Explosion des ventes organiques", color: "green" },
                        { icon: BarChart3, title: "Budget stable, CA stable, rentabilité up", subtitle: "Efficacité maximale", color: "blue" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-2xl flex items-center justify-center`}>
                            <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                            <p className="text-sm text-gray-600">{item.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 text-white">
                    <h4 className="text-2xl font-bold mb-8">Résultats obtenus</h4>
                    <div className="space-y-6">
                      {[
                        { value: "+35%", label: "ROAS global", color: "green" },
                        { value: "-40%", label: "Dépenses inutiles", color: "red" },
                        { value: "+300%", label: "Perf Shopping", color: "yellow" }
                      ].map((metric, index) => (
                        <div key={index} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                          <div className="text-4xl font-bold mb-2">{metric.value}</div>
                          <div className="text-sm opacity-90">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-12">
                  <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="px-8 py-4 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300">
                      Voir plus de cas
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Méthodologie */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Méthodologie de collaboration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus clair et transparent pour des résultats garantis
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {methodology.map((step, index) => (
                <div key={step.step} className="relative">
                  <Card className="text-center border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 h-full">
                    <CardContent className="p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-xl">
                        {step.step}
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                  
                  {index < methodology.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Commencez dès aujourd'hui
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Témoignages clients
            </h2>
            <p className="text-xl text-gray-600">
              Ce que disent mes clients de notre collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-8 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* À propos */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                  À propos
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Je suis Victor Soldet, freelance SEA et consultant Google Ads passionné par l'innovation technologique.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Après des années d'expérience dans l'acquisition digitale, j'ai créé Inconnu OS pour répondre aux 
                  limitations des outils traditionnels. Mon objectif : démocratiser l'optimisation intelligente des 
                  campagnes Google Ads.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Ma vision ? L'acquisition responsable : des campagnes performantes, transparentes et éthiques, 
                  où chaque euro dépensé génère un retour mesurable.
                </p>
                
                <div className="flex space-x-4">
                  <Button variant="outline" size="lg" className="px-6 py-3 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300">
                    <Linkedin className="w-5 h-5 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" size="lg" className="px-6 py-3 rounded-2xl border-2 border-gray-600 text-gray-600 hover:bg-gray-50 transform hover:scale-105 transition-all duration-300">
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-10 text-white shadow-2xl">
                <h3 className="text-3xl font-bold mb-8">Mon expertise</h3>
                <div className="space-y-6">
                  {[
                    "Expert Google Ads certifié",
                    "Développeur full-stack",
                    "Spécialiste e-commerce",
                    "Optimisation conversion",
                    "IA & Machine Learning"
                  ].map((expertise, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                      <span className="text-lg">{expertise}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contact" className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-blue-600/20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Prêt à booster vos campagnes sans agence ?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Réservez un audit gratuit ou contactez-moi pour discuter de vos objectifs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="https://calendly.com/victor-soldet/audit-gratuit" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-10 py-6 rounded-2xl bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Phone className="mr-3 w-5 h-5" />
                Planifier un appel
              </Button>
            </a>
            <Link href="/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-6 rounded-2xl border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <BarChart3 className="mr-3 w-5 h-5" />
                Demander un audit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">AI</span>
                  </div>
                </div>
                <span className="text-2xl font-bold">Agence Inconnu</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Vos données sont protégées et 100% confidentielles (RGPD)
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors">Audit Google Ads</li>
                <li className="hover:text-white transition-colors">Gestion de campagnes</li>
                <li className="hover:text-white transition-colors">Optimisation continue</li>
                <li className="hover:text-white transition-colors">Formation équipes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-3 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>contact@agence-inconnu.fr</span>
                </li>
                <li className="flex items-center space-x-3 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>+33 6 XX XX XX XX</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Légal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Agence Inconnu. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  )
}
