import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    features: {
      dateRangeSelector: true,
      charts: true,
      grpc: true
    }
  })
} // Force rebuild
