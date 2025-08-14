import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      features: {
        mcc: true,
        googleAds: true,
        admin: true,
        client: true
      }
    })
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy",
        error: "Service unavailable",
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
} 