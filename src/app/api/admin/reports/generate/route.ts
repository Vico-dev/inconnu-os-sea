import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ReportService } from '@/lib/report-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      clientAccountId, 
      period, 
      format = 'PDF',
      includeCharts = true,
      includeRecommendations = true 
    } = body

    // Validation
    if (!clientAccountId || !period?.start || !period?.end) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Générer le rapport
    const reportBuffer = await ReportService.generateReport(
      clientAccountId,
      {
        start: new Date(period.start),
        end: new Date(period.end)
      },
      {
        format: format as 'PDF' | 'EXCEL',
        includeCharts,
        includeRecommendations
      }
    )

    // Retourner le fichier
    const contentType = format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const filename = `rapport-google-ads-${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`

    return new NextResponse(reportBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    )
  }
} 