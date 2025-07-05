import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get('activityId')
    
    if (!activityId) {
      return NextResponse.json({ error: 'Activity ID required' }, { status: 400 })
    }
    
    // Check if file exists in public/maps directory
    const publicMapsPath = path.join(process.cwd(), 'public', 'maps', `${activityId}.png`)
    
    try {
      const stats = await fs.stat(publicMapsPath)
      
      return NextResponse.json({
        exists: true,
        path: publicMapsPath,
        size: stats.size,
        modified: stats.mtime,
        url: `/maps/${activityId}.png`
      })
    } catch (error) {
      // File doesn't exist
      return NextResponse.json({
        exists: false,
        path: publicMapsPath,
        error: 'File not found',
        url: `/maps/${activityId}.png`
      })
    }
  } catch (error) {
    console.error('Error checking map file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also provide a list of available maps
export async function POST() {
  try {
    const publicMapsPath = path.join(process.cwd(), 'public', 'maps')
    
    try {
      const files = await fs.readdir(publicMapsPath)
      const pngFiles = files.filter(file => file.endsWith('.png'))
      
      return NextResponse.json({
        totalMaps: pngFiles.length,
        sampleMaps: pngFiles.slice(0, 10),
        mapsDirectory: publicMapsPath
      })
    } catch (error) {
      return NextResponse.json({
        totalMaps: 0,
        sampleMaps: [],
        error: 'Maps directory not found',
        mapsDirectory: publicMapsPath
      })
    }
  } catch (error) {
    console.error('Error listing map files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
