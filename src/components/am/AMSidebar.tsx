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
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react"

interface AMSidebarProps {
  ticketStats?: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  appointmentStats?: {
    scheduled: number
    completed: number
    cancelled: number
  }
}

export function AMSidebar({ ticketStats, appointmentStats }: AMSidebarProps) {
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
      href: "/am",
      icon: LayoutDashboard,
      current: pathname === "/am"
    },
    {
      name: "Mes Tickets",
      href: "/am/tickets",
      icon: MessageSquare,
      current: pathname === "/am/tickets" || pathname?.startsWith("/am/tickets/"),
      badge: ticketStats?.open ? `${ticketStats.open} ouverts` : undefined
    },
    {
      name: "Rendez-vous",
      href: "/am/appointments",
      icon: Calendar,
      current: pathname === "/am/appointments" || pathname?.startsWith("/am/appointments/"),
      badge: appointmentStats?.scheduled ? `${appointmentStats.scheduled} programmés` : undefined
    },
    {
      name: "Mes Clients",
      href: "/am/clients",
      icon: Users,
      current: pathname === "/am/clients"
    },
    {
      name: "Rapports",
      href: "/am/reports",
      icon: FileText,
      current: pathname === "/am/reports"
    },
    {
      name: "Analytics",
      href: "/am/analytics",
      icon: BarChart3,
      current: pathname === "/am/analytics"
    },
    {
      name: "Paramètres",
      href: "/am/settings",
      icon: Settings,
      current: pathname === "/am/settings"
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
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">AM</span>
            </div>
            <span className="font-semibold text-gray-900">Account Manager</span>
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
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge.includes("ouverts") || item.badge.includes("programmés") ? "destructive" : "secondary"}
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