import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const activityId = params.activityId
    
    // Check if static map exists (try both the provided ID and as external_id)
    const mapPath = path.join(process.cwd(), 'public', 'maps', `${activityId}.png`)
    
    try {
      await fs.access(mapPath)
      
      // Get file stats
      const stats = await fs.stat(mapPath)
      
      return NextResponse.json({
        exists: true,
        url: `/maps/${activityId}.png`,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      })
    } catch {
      return NextResponse.json({
        exists: false,
        url: null,
        message: `Static map not found for activity ${activityId}`
      })
    }
  } catch (error) {
    console.error('Error checking static map:', error)
    return NextResponse.json(
      { error: 'Failed to check static map' },
      { status: 500 }
    )
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const activityId = params.activityId
    const mapPath = path.join(process.cwd(), 'public', 'maps', `${activityId}.png`)
    
    try {
      await fs.access(mapPath)
      return new NextResponse(null, { status: 200 })
    } catch {
      return new NextResponse(null, { status: 404 })
    }
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
