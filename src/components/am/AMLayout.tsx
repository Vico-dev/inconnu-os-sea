"use client"

import { useState, useEffect } from "react"
import { AMSidebar } from "./AMSidebar"

interface AMLayoutProps {
  children: React.ReactNode
}

export function AMLayout({ children }: AMLayoutProps) {
  const [ticketStats, setTicketStats] = useState<any>(null)
  const [appointmentStats, setAppointmentStats] = useState<any>(null)

  useEffect(() => {
    // Ici on pourrait récupérer les stats depuis l&apos;API
    // Pour l&apos;instant, on utilise des valeurs par défaut
    setTicketStats({
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0
    })
    setAppointmentStats({
      scheduled: 0,
      completed: 0,
      cancelled: 0
    })
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <AMSidebar 
        ticketStats={ticketStats}
        appointmentStats={appointmentStats}
      />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
} 