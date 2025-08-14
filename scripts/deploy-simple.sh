#!/bin/bash

# Script de déploiement simple pour Inconnu OS (sans Docker)
set -e

echo "🚀 Démarrage du déploiement simple..."

# Variables
ENVIRONMENT=${1:-production}
APP_NAME="inconnu-os-sea"
PORT=${2:-3000}

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
    fi
    
    if [ ! -f ".env.local" ]; then
        warning "Fichier .env.local non trouvé - utilisation des variables d'environnement système"
    fi
    
    log "✅ Prérequis vérifiés"
}

# Installer les dépendances
install_dependencies() {
    log "Installation des dépendances..."
    
    npm ci --legacy-peer-deps
    
    if [ $? -eq 0 ]; then
        log "✅ Dépendances installées"
    else
        error "❌ Échec de l'installation des dépendances"
    fi
}

# Générer le client Prisma
generate_prisma() {
    log "Génération du client Prisma..."
    
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        log "✅ Client Prisma généré"
    else
        error "❌ Échec de la génération du client Prisma"
    fi
}

# Appliquer les migrations
run_migrations() {
    log "Application des migrations de base de données..."
    
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        log "✅ Migrations appliquées"
    else
        error "❌ Échec des migrations"
    fi
}

# Build de l'application
build_app() {
    log "Build de l'application..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log "✅ Application construite"
    else
        error "❌ Échec du build"
    fi
}

# Démarrer l'application
start_app() {
    log "Démarrage de l'application sur le port $PORT..."
    
    # Arrêter l'application existante si elle tourne
    pkill -f "next start" || true
    
    # Démarrer en arrière-plan
    nohup npm start > app.log 2>&1 &
    
    # Sauvegarder le PID
    echo $! > app.pid
    
    log "✅ Application démarrée (PID: $(cat app.pid))"
}

# Vérification de santé
health_check() {
    log "Vérification de santé de l'application..."
    
    # Attendre que l'application soit prête
    sleep 10
    
    # Vérifier que l'application répond
    if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
        log "✅ Application en ligne sur http://localhost:$PORT"
    else
        warning "⚠️  Application non accessible immédiatement - vérifiez les logs"
    fi
}

# Afficher les informations de déploiement
show_info() {
    log "📋 Informations de déploiement:"
    echo "   🌐 URL: http://localhost:$PORT"
    echo "   🔧 Environnement: $ENVIRONMENT"
    echo "   📁 Logs: app.log"
    echo "   🆔 PID: $(cat app.pid 2>/dev/null || echo 'N/A')"
    echo ""
    log "🎯 URLs importantes:"
    echo "   📊 Admin: http://localhost:$PORT/admin"
    echo "   🔗 MCC: http://localhost:$PORT/admin/mcc"
    echo "   👥 Clients: http://localhost:$PORT/client"
    echo ""
    log "📝 Commandes utiles:"
    echo "   🔍 Voir les logs: tail -f app.log"
    echo "   🛑 Arrêter l'app: kill \$(cat app.pid)"
    echo "   🔄 Redémarrer: ./scripts/deploy-simple.sh"
}

# Fonction principale
main() {
    log "Démarrage du déploiement simple sur $ENVIRONMENT"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Installer les dépendances
    install_dependencies
    
    # Générer Prisma
    generate_prisma
    
    # Appliquer les migrations
    run_migrations
    
    # Construire l'application
    build_app
    
    # Démarrer l'application
    start_app
    
    # Vérifier la santé
    health_check
    
    # Afficher les informations
    show_info
    
    log "🎉 Déploiement terminé avec succès!"
}

# Gestion des erreurs
trap 'error "Déploiement interrompu"' INT TERM

# Exécuter le script principal
main "$@" 