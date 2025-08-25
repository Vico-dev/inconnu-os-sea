import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ReportService } from '@/lib/report-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !['ADMIN', 'ACCOUNT_MANAGER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { clientAccountId, format = 'PDF', includeRecommendations = true, customPeriod } = body

    if (!clientAccountId) {
      return NextResponse.json(
        { error: "ID du compte client requis" },
        { status: 400 }
      )
    }

    // Générer le rapport
    const reportBuffer = await ReportService.generateClientReport(clientAccountId, {
      format: format as 'PDF' | 'EXCEL',
      includeRecommendations,
      customPeriod
    })

    // Définir les headers selon le format
    const headers = new Headers()
    const filename = `rapport-google-ads-${Date.now()}.${format.toLowerCase()}`
    
    if (format === 'PDF') {
      headers.set('Content-Type', 'application/pdf')
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    } else {
      headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    }

    return new NextResponse(reportBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { error: "Erreur lors de la génération du rapport" },
      { status: 500 }
    )
  }
} 