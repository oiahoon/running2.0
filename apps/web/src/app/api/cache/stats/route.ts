import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const mapsDir = path.join(process.cwd(), 'public', 'maps')
    
    // Check if maps directory exists
    try {
      await fs.access(mapsDir)
    } catch {
      return NextResponse.json({
        totalFiles: 0,
        totalSize: 0,
        totalSizeMB: 0,
        oldestFile: null,
        newestFile: null,
        files: []
      })
    }
    
    const files = await fs.readdir(mapsDir)
    const pngFiles = files.filter(f => f.endsWith('.png'))
    
    let totalSize = 0
    let oldestFile: Date | null = null
    let newestFile: Date | null = null
    const fileDetails = []
    
    for (const file of pngFiles) {
      const filePath = path.join(mapsDir, file)
      try {
        const stats = await fs.stat(filePath)
        totalSize += stats.size
        
        if (!oldestFile || stats.mtime < oldestFile) {
          oldestFile = stats.mtime
        }
        if (!newestFile || stats.mtime > newestFile) {
          newestFile = stats.mtime
        }
        
        fileDetails.push({
          name: file,
          activityId: file.replace('.png', ''),
          size: stats.size,
          sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          lastModified: stats.mtime.toISOString(),
          url: `/maps/${file}`
        })
      } catch (error) {
        console.error(`Error reading file stats for ${file}:`, error)
      }
    }
    
    // Sort files by last modified (newest first)
    fileDetails.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    
    return NextResponse.json({
      totalFiles: pngFiles.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      oldestFile: oldestFile?.toISOString() || null,
      newestFile: newestFile?.toISOString() || null,
      files: fileDetails
    })
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}
