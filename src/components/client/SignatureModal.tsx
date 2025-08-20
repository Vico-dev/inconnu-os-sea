'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Mail, Shield, Clock } from 'lucide-react'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mandateNumber: string
  initialStep?: 'request' | 'verify'
  initialExpiresAt?: string
}

export default function SignatureModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  mandateNumber,
  initialStep = 'request',
  initialExpiresAt
}: SignatureModalProps) {
  const [step, setStep] = useState<'request' | 'verify'>(initialStep)
  const [signatureCode, setSignatureCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string>(initialExpiresAt || '')

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep)
      setExpiresAt(initialExpiresAt || '')
      setSignatureCode('')
    }
  }, [isOpen, initialStep, initialExpiresAt])

  const requestCode = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/client/mandate/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStep('verify')
        setExpiresAt(data.expiresAt)
        toast.success('Code de signature envoyé par email')
      } else {
        toast.error(data.error || 'Erreur lors de l\'envoi du code')
        console.error('Signature code POST error:', data)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de l\'envoi du code')
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCode = async () => {
    if (!signatureCode.trim()) {
      toast.error('Veuillez saisir le code de signature')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/client/mandate/signature', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signatureCode: signatureCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Signature électronique validée avec succès !')
        onSuccess()
        onClose()
        setStep('request')
        setSignatureCode('')
      } else {
        toast.error(data.error || 'Code de signature invalide')
        console.error('Signature code PUT error:', data)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la vérification du code')
    } finally {
      setIsLoading(false)
    }
  }

  const formatExpirationTime = (expiresAt: string) => {
    const date = new Date(expiresAt)
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Signature électronique sécurisée
          </DialogTitle>
        </DialogHeader>

        {step === 'request' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Pour signer électroniquement votre mandat <strong>{mandateNumber}</strong>, 
                nous allons vous envoyer un code de sécurité par email.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">Code envoyé par email</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Le code sera envoyé à l'adresse email de votre compte
                </p>
              </div>
            </div>

            <Button 
              onClick={requestCode} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer le code de signature
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Saisissez le code de signature reçu par email :
              </p>
              {expiresAt && (
                <div className="flex items-center justify-center gap-2 text-orange-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Expire à {formatExpirationTime(expiresAt)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatureCode">Code de signature</Label>
              <Input
                id="signatureCode"
                type="text"
                placeholder="Ex: ABC123"
                value={signatureCode}
                onChange={(e) => setSignatureCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('request')}
                className="flex-1"
              >
                Retour
              </Button>
              <Button 
                onClick={verifyCode} 
                disabled={isLoading || !signatureCode.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  'Valider la signature'
                )}
              </Button>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>⚠️ Sécurité :</strong> Ce code est valable 15 minutes uniquement. 
                Ne le partagez jamais avec quiconque.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 