"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Target, 
  Zap, 
  ShoppingCart, 
  Plus, 
  TrendingUp, 
  Settings,
  BarChart3,
  Users,
  Eye,
  Brain,
  Database,
  RefreshCw
} from "lucide-react"
import { FeedManager } from "@/components/admin/FeedManager"
import { CampaignCreator } from "@/components/admin/CampaignCreator"
import { CampaignOptimizer } from "@/components/admin/CampaignOptimizer"

export default function CampaignOperatorPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("creator")

  const tabs = [
    {
      id: "creator",
      title: "Campaign Creator",
      description: "Créer des campagnes performantes",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "optimizer", 
      title: "Campaign Optimizer",
      description: "Optimiser les campagnes existantes",
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "feedmanager",
      title: "Feed Manager", 
      description: "Gérer le flux produit",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <Target className="w-8 h-8 text-primary" />
              <span>Campaign Operator</span>
            </h1>
            <p className="text-muted-foreground">
              Outil complet de création, optimisation et gestion de campagnes Google Ads
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Button>
          </div>
        </div>

        {/* Sub Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Campaign Creator Tab */}
          <TabsContent value="creator" className="space-y-6">
            <CampaignCreator />
          </TabsContent>

          {/* Campaign Optimizer Tab */}
          <TabsContent value="optimizer" className="space-y-6">
            <CampaignOptimizer />
          </TabsContent>

          {/* Feed Manager Tab */}
          <TabsContent value="feedmanager" className="space-y-6">
            <FeedManager />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
} 