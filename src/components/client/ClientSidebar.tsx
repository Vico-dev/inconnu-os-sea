"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react"

export function ClientSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
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
      href: "/client",
      icon: LayoutDashboard,
      current: pathname === "/client"
    },
    {
      name: "Tickets",
      href: "/client/tickets",
      icon: MessageSquare,
      current: pathname?.startsWith("/client/tickets")
    },
    {
      name: "Rendez-vous",
      href: "/client/request-appointment",
      icon: Calendar,
      current: pathname === "/client/request-appointment"
    },
    {
      name: "Abonnement",
      href: "/client/subscribe",
      icon: CreditCard,
      current: pathname?.startsWith("/client/subscribe") || pathname === "/client/change-plan"
    },
    {
      name: "Performance",
      href: "/client/google-ads",
      icon: BarChart3,
      current: pathname === "/client/google-ads"
    },
    {
      name: "Paramètres",
      href: "/client",
      icon: Settings,
      current: false
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 h-screen transition-all duration-300 flex flex-col ${isCollapsed ? "w-20" : "w-64"}`}>
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          {!isCollapsed && <span className="font-semibold text-gray-900">Espace Client</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href} className={`group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${item.current ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
              <Icon className={`mr-3 h-5 w-5 ${item.current ? "text-blue-700" : "text-gray-400 group-hover:text-gray-600"}`} />
              {!isCollapsed && (
                <span className="flex-1">
                  {item.name}
                </span>
              )}
              {!isCollapsed && (item as any).badge && (
                <Badge variant="secondary" className="ml-auto">{(item as any).badge}</Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <Button variant="outline" className="w-full flex items-center" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          {!isCollapsed && "Déconnexion"}
        </Button>
      </div>
    </div>
  )
}