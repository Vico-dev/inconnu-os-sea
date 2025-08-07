#!/bin/bash

# Script de déploiement pour Inconnu OS
set -e

echo "🚀 Démarrage du déploiement..."

# Variables
ENVIRONMENT=${1:-staging}
APP_NAME="inconnu-os"
DOCKER_REGISTRY="your-registry.com"

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
    
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
    fi
    
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        error "Fichier .env.$ENVIRONMENT non trouvé"
    fi
    
    log "✅ Prérequis vérifiés"
}

# Build de l'image Docker
build_image() {
    log "Construction de l'image Docker..."
    
    docker build -t $APP_NAME:$ENVIRONMENT .
    
    if [ $? -eq 0 ]; then
        log "✅ Image construite avec succès"
    else
        error "❌ Échec de la construction de l'image"
    fi
}

# Tests avant déploiement
run_tests() {
    log "Exécution des tests..."
    
    # Tests unitaires
    npm test
    
    # Tests de build
    npm run build
    
    log "✅ Tests passés avec succès"
}

# Déploiement
deploy() {
    log "Déploiement sur $ENVIRONMENT..."
    
    case $ENVIRONMENT in
        "staging")
            # Déploiement staging
            docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
            ;;
        "production")
            # Déploiement production
            docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
            ;;
        *)
            error "Environnement '$ENVIRONMENT' non reconnu"
            ;;
    esac
    
    log "✅ Déploiement terminé"
}

# Vérification de santé
health_check() {
    log "Vérification de santé de l'application..."
    
    # Attendre que l'application soit prête
    sleep 30
    
    # Vérifier que l'application répond
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log "✅ Application en ligne"
    else
        error "❌ Application non accessible"
    fi
}

# Rollback en cas d'échec
rollback() {
    warning "Rollback en cours..."
    
    # Restaurer la version précédente
    docker-compose down
    docker-compose up -d
    
    log "✅ Rollback terminé"
}

# Nettoyage
cleanup() {
    log "Nettoyage des ressources..."
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    # Supprimer les conteneurs arrêtés
    docker container prune -f
    
    log "✅ Nettoyage terminé"
}

# Fonction principale
main() {
    log "Démarrage du déploiement sur $ENVIRONMENT"
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Exécuter les tests
    run_tests
    
    # Construire l'image
    build_image
    
    # Déployer
    deploy
    
    # Vérifier la santé
    health_check
    
    # Nettoyer
    cleanup
    
    log "🎉 Déploiement terminé avec succès!"
}

# Gestion des erreurs
trap 'error "Déploiement interrompu"' INT TERM
trap 'rollback' ERR

# Exécuter le script principal
main "$@" 