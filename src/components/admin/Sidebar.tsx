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
  AlertCircle
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
            <Link
              key={item.name}
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