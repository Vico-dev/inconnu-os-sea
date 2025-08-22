"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle, XCircle, Clock, AlertCircle, History, Users, 
  TrendingUp, Calendar, Eye, MessageSquare, ArrowRight
} from "lucide-react"

interface Approval {
  id: string
  status: string
  currentStep: number
  totalSteps: number
  submittedAt: string
  campaign: {
    id: string
    name: string
    type: string
    budget: number
    client: {
      name: string
      email: string
    }
  }
  approvals: {
    id: string
    stepNumber: number
    stepName: string
    approverName: string
    status: string
    comments?: string
    approvedAt?: string
    rejectedAt?: string
  }[]
  history: {
    id: string
    action: string
    userName: string
    userRole: string
    comments?: string
    timestamp: string
  }[]
}

export default function ApprovalsPage() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [currentStep, setCurrentStep] = useState(0)
  const [comments, setComments] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchApprovals()
  }, [])

  const fetchApprovals = async () => {
    try {
      const response = await fetch('/api/admin/approvals')
      const data = await response.json()
      setApprovals(data)
    } catch (error) {
      console.error('Erreur lors du chargement des approbations:', error)
    }
  }

  const handleAction = async () => {
    if (!selectedApproval || !comments.trim()) return

    setIsLoading(true)
    try {
      const endpoint = actionType === 'approve' 
        ? `/api/admin/approvals/${selectedApproval.id}/approve`
        : `/api/admin/approvals/${selectedApproval.id}/reject`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepNumber: currentStep,
          comments: comments.trim()
        })
      })

      if (response.ok) {
        await fetchApprovals()
        setShowActionDialog(false)
        setComments("")
      }
    } catch (error) {
      console.error('Erreur lors de l\'action:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getProgressPercentage = (approval: Approval) => {
    const approvedSteps = approval.approvals.filter(a => a.status === 'APPROVED').length
    return (approvedSteps / approval.totalSteps) * 100
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ACCOUNT_MANAGER"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Workflow d'Approbation</h1>
            <p className="text-muted-foreground">
              Gestion des approbations de campagnes et historique des modifications
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {approvals.length} approbations
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">En Attente</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
            <TabsTrigger value="rejected">Rejetées</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {approvals
              .filter(a => a.status === 'PENDING')
              .map((approval) => (
                <Card key={approval.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {approval.campaign.name}
                          <Badge variant="outline">{approval.campaign.type}</Badge>
                        </CardTitle>
                        <CardDescription>
                          Client: {approval.campaign.client.name} • 
                          Budget: {approval.campaign.budget.toLocaleString()}€
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApproval(approval)
                            setShowHistoryDialog(true)
                          }}
                        >
                          <History className="w-4 h-4 mr-1" />
                          Historique
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApproval(approval)
                            setCurrentStep(approval.currentStep)
                            setShowActionDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Examiner
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{approval.currentStep}/{approval.totalSteps}</span>
                      </div>
                      <Progress value={getProgressPercentage(approval)} />
                    </div>

                    {/* Steps */}
                    <div className="mt-4 space-y-2">
                      {approval.approvals.map((step) => (
                        <div
                          key={step.id}
                          className={`flex items-center justify-between p-2 rounded ${
                            step.status === 'APPROVED' ? 'bg-green-50' :
                            step.status === 'REJECTED' ? 'bg-red-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="font-medium">{step.stepName}</span>
                            <span className="text-sm text-muted-foreground">
                              ({step.approverName})
                            </span>
                          </div>
                          <Badge className={getStatusColor(step.status)}>
                            {step.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {approvals
              .filter(a => a.status === 'APPROVED')
              .map((approval) => (
                <Card key={approval.id} className="bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      {approval.campaign.name}
                    </CardTitle>
                    <CardDescription>
                      Approuvée le {new Date(approval.submittedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {approvals
              .filter(a => a.status === 'REJECTED')
              .map((approval) => (
                <Card key={approval.id} className="bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      {approval.campaign.name}
                    </CardTitle>
                    <CardDescription>
                      Rejetée le {new Date(approval.submittedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Historique des Modifications</DialogTitle>
            </DialogHeader>
            {selectedApproval && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {selectedApproval.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                      <div className="flex-shrink-0">
                        {entry.action === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {entry.action === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
                        {entry.action === 'SUBMITTED' && <Clock className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.userName}</span>
                          <Badge variant="outline">{entry.userRole}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {entry.comments && (
                          <p className="text-sm mt-1">{entry.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Action Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approuver' : 'Rejeter'} l'étape
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="comments">Commentaires</Label>
                <Textarea
                  id="comments"
                  placeholder={actionType === 'approve' 
                    ? "Commentaires optionnels..." 
                    : "Raison du rejet (requis)"
                  }
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowActionDialog(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={isLoading || (actionType === 'reject' && !comments.trim())}
                >
                  {isLoading ? 'En cours...' : actionType === 'approve' ? 'Approuver' : 'Rejeter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
} 