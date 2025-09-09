import { NextRequest, NextResponse } from 'next/server';
import { GMCService } from '@/lib/gmc-service';

export async function POST(request: NextRequest) {
  try {
    const { products, merchantId } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Produits requis et doivent être un tableau' },
        { status: 400 }
      );
    }

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Merchant ID requis' },
        { status: 400 }
      );
    }

    console.log(`🚀 Export GMC: ${products.length} produits vers merchant ${merchantId}`);

    const gmcService = new GMCService();
    const result = await gmcService.exportProducts(products, merchantId);

    if (result.success) {
      console.log(`✅ Export GMC réussi: ${result.exportedCount} produits exportés`);
    } else {
      console.log(`⚠️ Export GMC partiel: ${result.exportedCount} exportés, ${result.errors.length} erreurs`);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Erreur export GMC:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'export GMC',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const batchId = searchParams.get('batchId');

    if (!merchantId) {
      return NextResponse.json(
        { error: 'Merchant ID requis' },
        { status: 400 }
      );
    }

    const gmcService = new GMCService();
    const status = await gmcService.getExportStatus(merchantId, batchId || undefined);

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('❌ Erreur récupération statut GMC:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut GMC',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 