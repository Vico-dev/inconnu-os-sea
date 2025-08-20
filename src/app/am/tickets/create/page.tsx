"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
// AMLayout retiré: fourni par app/am/layout.tsx
import { useRouter } from "next/navigation"

export default function AMCreateTicketPage() {
  const router = useRouter()

  return (
    <ProtectedRoute allowedRoles={["ACCOUNT_MANAGER"]}>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Sujet" />
            <Textarea placeholder="Description" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push('/am/tickets')}>Annuler</Button>
              <Button>Créer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 