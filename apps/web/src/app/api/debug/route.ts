import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database/connection'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const isProduction = process.env.NODE_ENV === 'production'
    const isVercel = process.env.VERCEL === '1'
    
    let environment = 'development'
    if (isVercel) environment = 'vercel'
    else if (isProduction) environment = 'production'

    // Get database path
    let dbPath: string
    if (isVercel) {
      dbPath = '/tmp/running_page_2.db'
    } else if (isProduction) {
      dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'running_page_2.db')
    } else {
      dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'running_page_2.db')
    }

    const databaseExists = fs.existsSync(dbPath)
    
    let activitiesCount = 0
    let error: string | undefined

    try {
      const db = getDatabase()
      const result = db.prepare('SELECT COUNT(*) as count FROM activities').get() as { count: number }
      activitiesCount = result.count
    } catch (dbError) {
      error = `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
    }

    return NextResponse.json({
      environment,
      databasePath: dbPath,
      databaseExists,
      activitiesCount,
      error,
      vercelEnv: process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: `Debug API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        environment: 'unknown',
        databasePath: 'unknown',
        databaseExists: false,
        activitiesCount: 0,
      },
      { status: 500 }
    )
  }
}
