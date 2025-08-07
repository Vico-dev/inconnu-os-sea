"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./Sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    unassigned: 0,
    inProgress: 0
  })
  const [billingStats, setBillingStats] = useState({
    activeSubscriptions: 0,
    pendingPayments: 0,
    overduePayments: 0
  })

  useEffect(() => {
    // Charger les statistiques des tickets
    const fetchTicketStats = async () => {
      try {
        const response = await fetch("/api/admin/tickets/stats")
        if (response.ok) {
          const data = await response.json()
          setTicketStats({
            total: data.total,
            unassigned: data.unassigned,
            inProgress: data.inProgress
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques des tickets:", error)
      }
    }

    // Charger les statistiques de facturation
    const fetchBillingStats = async () => {
      try {
        const response = await fetch("/api/admin/billing/stats")
        if (response.ok) {
          const data = await response.json()
          setBillingStats(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques de facturation:", error)
      }
    }

    fetchTicketStats()
    fetchBillingStats()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar ticketStats={ticketStats} billingStats={billingStats} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
} 