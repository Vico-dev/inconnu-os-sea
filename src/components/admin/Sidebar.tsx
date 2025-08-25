"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
  FileText,
  TrendingUp,
  AlertCircle,
  Shield,
  Building,
  Target,
  CheckSquare,
  Brain,
  Zap,
  ShoppingCart
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

interface SidebarProps {
  ticketStats?: {
    total: number
    unassigned: number
    inProgress: number
  }
  billingStats?: {
    activeSubscriptions: number
    pendingPayments: number
    overduePayments: number
  }
}

export function Sidebar({ ticketStats, billingStats }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    console.log("Déconnexion en cours...")
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin"
    },
    {
      name: "Utilisateurs",
      href: "/admin/users",
      icon: Users,
      current: pathname === "/admin/users",
      badge: "Gérer"
    },
    {
      name: "Entreprises",
      href: "/admin/companies",
      icon: Building,
      current: pathname === "/admin/companies"
    },
    {
      name: "Tickets",
      href: "/admin/tickets",
      icon: MessageSquare,
      current: pathname === "/admin/tickets",
      badge: ticketStats?.unassigned ? `${ticketStats.unassigned} non assignés` : undefined
    },
    {
      name: "Facturation",
      href: "/admin/billing",
      icon: CreditCard,
      current: pathname === "/admin/billing",
      badge: billingStats?.pendingPayments ? `${billingStats.pendingPayments} en attente` : undefined
    },
    {
      name: "Rapports",
      href: "/admin/reports",
      icon: BarChart3,
      current: pathname === "/admin/reports"
    },
    {
      name: "Paramètres",
      href: "/admin/settings",
      icon: Settings,
      current: pathname === "/admin/settings"
    },
    {
      name: "Google Ads Permissions",
      href: "/admin/google-ads-permissions",
      icon: Shield,
      current: pathname === "/admin/google-ads-permissions"
    },

    {
      name: "Prospects",
      href: "/admin/prospects",
      icon: Users,
      current: pathname === "/admin/prospects"
    },
    {
      name: "Campaign Operator",
      href: "/admin/campaign-operator",
      icon: Target,
      current: pathname.startsWith("/admin/campaign-operator"),
      subItems: [
        {
          name: "Campaign Creator",
          href: "/admin/campaign-operator/creator",
          icon: Target,
          current: pathname === "/admin/campaign-operator/creator"
        },
        {
          name: "Campaign Optimizer",
          href: "/admin/campaign-operator/optimizer",
          icon: Zap,
          current: pathname === "/admin/campaign-operator/optimizer"
        },
        {
          name: "Feed Manager",
          href: "/admin/campaign-operator/feed-manager",
          icon: ShoppingCart,
          current: pathname === "/admin/campaign-operator/feed-manager"
        }
      ]
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-gray-900">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.current
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant={item.badge.includes("non assignés") || item.badge.includes("en attente") ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
              
              {/* Sous-onglets pour Campaign Operator */}
              {item.subItems && item.current && !isCollapsed && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                          subItem.current
                            ? "bg-blue-100 text-blue-800"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span>{subItem.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 ${isCollapsed ? "w-10 h-10 p-0" : "w-full"}`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  )
} 