"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { 
  Settings, 
  Shield,
  Bell,
  Mail,
  Database,
  Key
} from "lucide-react"

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    siteName: "Agence Inconnu",
    contactEmail: "contact@agence-inconnu.fr",
    notifications: true,
    emailNotifications: true,
    maintenanceMode: false,
    debugMode: false
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    // Ici on pourrait sauvegarder les paramètres
    console.log("Paramètres sauvegardés:", settings)
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres Administratifs</h1>
            <p className="text-gray-600">Configurez les paramètres de la plateforme</p>
          </div>

          <div className="space-y-6">
            {/* Paramètres généraux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Paramètres Généraux
                </CardTitle>
                <CardDescription>
                  Configuration de base de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site-name">Nom du site</Label>
                  <Input 
                    id="site-name" 
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email de contact</Label>
                  <Input 
                    id="contact-email" 
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sécurité
                </CardTitle>
                <CardDescription>
                  Configuration de la sécurité de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode maintenance</Label>
                    <p className="text-sm text-gray-600">Désactiver l&apos;accès public</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode debug</Label>
                    <p className="text-sm text-gray-600">Afficher les erreurs détaillées</p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres de notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configuration des notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-600">Notifications en temps réel</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications email</Label>
                    <p className="text-sm text-gray-600">Recevoir les alertes par email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Intégrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Intégrations
                </CardTitle>
                <CardDescription>
                  Configuration des services externes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stripe-key">Clé Stripe (masquée)</Label>
                  <Input 
                    id="stripe-key" 
                    type="password" 
                    defaultValue="sk_test_..."
                    placeholder="sk_test_..."
                  />
                </div>
                <div>
                  <Label htmlFor="resend-key">Clé Resend (masquée)</Label>
                  <Input 
                    id="resend-key" 
                    type="password" 
                    defaultValue="re_..."
                    placeholder="re_..."
                  />
                </div>
                <div>
                  <Label htmlFor="google-ads-key">Clé Google Ads (masquée)</Label>
                  <Input 
                    id="google-ads-key" 
                    type="password" 
                    defaultValue="..."
                    placeholder="..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Base de données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Base de Données
                </CardTitle>
                <CardDescription>
                  Informations sur la base de données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type de base</span>
                  <span className="text-sm text-gray-600">SQLite (dev) / PostgreSQL (prod)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taille</span>
                  <span className="text-sm text-gray-600">2.4 MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dernière sauvegarde</span>
                  <span className="text-sm text-gray-600">Il y a 2 heures</span>
                </div>
                <Button variant="outline" size="sm">
                  Créer une sauvegarde
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button variant="outline">
                Réinitialiser
              </Button>
              <Button onClick={handleSave}>
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
} 