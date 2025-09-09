'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface GMCExportButtonProps {
  products: any[];
  onExportComplete?: (result: any) => void;
}

export function GMCExportButton({ products, onExportComplete }: GMCExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);

  useEffect(() => {
    // Pré-remplir depuis la config client
    const fetchMerchant = async () => {
      try {
        const res = await fetch('/api/client/gmc');
        const data = await res.json();
        if (data.success && data.merchantId) setMerchantId(data.merchantId);
      } catch {}
    };
    fetchMerchant();
  }, []);

  const handleExport = async () => {
    if (!merchantId.trim()) {
      alert('Veuillez saisir un Merchant ID');
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      const response = await fetch('/api/gmc/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          merchantId: merchantId.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setExportResult(result);
        onExportComplete?.(result);
        
        if (result.success) {
          setTimeout(() => setIsOpen(false), 3000);
        }
      } else {
        setExportResult({
          success: false,
          error: result.error || 'Erreur lors de l\'export',
        });
      }
    } catch (error: any) {
      setExportResult({
        success: false,
        error: error.message || 'Erreur réseau',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getExportStatusIcon = () => {
    if (!exportResult) return null;
    
    if (exportResult.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getExportStatusText = () => {
    if (!exportResult) return '';
    
    if (exportResult.success) {
      return `Export réussi: ${exportResult.exportedCount} produits exportés`;
    }
    
    if (exportResult.exportedCount > 0) {
      return `Export partiel: ${exportResult.exportedCount} exportés, ${exportResult.errors?.length || 0} erreurs`;
    }
    
    return `Export échoué: ${exportResult.error}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Export GMC
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export vers Google Merchant Center</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="merchantId">Merchant ID GMC</Label>
            <Input
              id="merchantId"
              placeholder="123456789"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              disabled={isExporting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Pré-rempli depuis vos paramètres client. Vous pouvez modifier si besoin.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Badge variant="secondary">{products.length} produits</Badge>
            <span>prêts à l'export</span>
          </div>

          {exportResult && (
            <div className={`p-3 rounded-lg border ${
              exportResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {getExportStatusIcon()}
                <span className="text-sm font-medium">
                  {getExportStatusText()}
                </span>
              </div>
              
              {exportResult.errors && exportResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-700 mb-1">Erreurs:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {exportResult.errors.slice(0, 5).map((error: any, index: number) => (
                      <div key={index} className="text-xs text-red-600">
                        Produit {error.productId}: {error.error}
                      </div>
                    ))}
                    {exportResult.errors.length > 5 && (
                      <div className="text-xs text-red-600">
                        ... et {exportResult.errors.length - 5} autres erreurs
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !merchantId.trim()}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Exporter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 