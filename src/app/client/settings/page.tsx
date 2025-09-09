"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ClientSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [merchantId, setMerchantId] = useState("")
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    const fetchGMC = async () => {
      try {
        const res = await fetch('/api/client/gmc')
        const data = await res.json()
        if (data.success && data.merchantId) setMerchantId(data.merchantId)
      } catch (e) {
        // noop
      } finally {
        setLoading(false)
      }
    }
    fetchGMC()
  }, [])

  const save = async () => {
    setSaving(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/client/gmc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId })
      })
      if (res.ok) setTestResult('✅ Enregistré')
      else setTestResult('❌ Erreur à l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const test = async () => {
    setTestResult('⏳ Test en cours...')
    try {
      const res = await fetch(`/api/gmc/export?merchantId=${encodeURIComponent(merchantId || '')}`)
      if (res.ok) setTestResult('✅ Connexion OK')
      else setTestResult('❌ Connexion refusée')
    } catch {
      setTestResult('❌ Erreur de connexion')
    }
  }

  return (
    <ProtectedRoute allowedRoles={["CLIENT"]}>
      <div className="p-6 space-y-6">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences de compte et intégrations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Google Merchant Center</CardTitle>
            <CardDescription>Configurez votre Merchant ID pour l’export produit</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-gray-600">Chargement…</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="merchantId">Merchant ID</Label>
                  <Input id="merchantId" value={merchantId} onChange={e => setMerchantId(e.target.value)} placeholder="123456789" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={test} variant="outline">Tester la connexion</Button>
                  <Button onClick={save} disabled={saving || !merchantId}>Enregistrer</Button>
                </div>
                {testResult && (
                  <div className="text-sm text-gray-700">{testResult}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

