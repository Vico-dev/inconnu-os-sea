import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Test de création d'un mandat minimal avec seulement les champs de base
    const mandateNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    
    // Utiliser seulement les champs qui existent certainement
    const mandateData = {
      clientAccountId: 1, // ID temporaire pour test
      mandateNumber,
      status: 'PENDING',
      version: 'v1.0',
      signedByName: 'Test User',
      signedByEmail: 'test@example.com',
      totalAnnualBudget: 1000,
      budgetType: 'FIXED',
      treasuryManagement: false,
      managementFees: 0,
      paymentTerms: '',
      termsAccepted: true,
      gdprAccepted: true,
      consentData: { test: true },
      scrollTracking: { test: true },
      legalVersion: 'v1.0'
    }

    // Test de création
    let testResult = null
    let testError = null

    try {
      testResult = await prisma.advertisingMandate.create({
        data: mandateData
      })
      
      // Supprimer le mandat de test
      await prisma.advertisingMandate.delete({
        where: { id: testResult.id }
      })
      
    } catch (error: any) {
      testError = {
        message: error.message,
        code: error.code,
        meta: error.meta
      }
    }

    // Vérifier la structure de la table
    let tableStructure = null
    try {
      // Essayer de récupérer les colonnes de la table
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'advertising_mandates' 
        ORDER BY ordinal_position
      `
      tableStructure = result
    } catch (error: any) {
      tableStructure = { error: error.message }
    }

    return NextResponse.json({
      success: true,
      testResult,
      testError,
      tableStructure,
      mandateData
    })

  } catch (error: any) {
    console.error('❌ Erreur test mandat:', error)
    return NextResponse.json({ 
      error: 'Erreur lors du test',
      details: error?.message || String(error),
      code: error?.code
    }, { status: 500 })
  }
} 