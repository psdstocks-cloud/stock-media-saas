import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const logo = formData.get('logo') as File
    const platformName = formData.get('platformName') as string
    const logoSize = formData.get('logoSize') as string

    if (!logo) {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 })
    }

    if (!platformName) {
      return NextResponse.json({ error: 'Platform name is required' }, { status: 400 })
    }

    // Validate file type
    if (!logo.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (logo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'platforms')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = logo.name.split('.').pop()
    const filename = `${platformName}-${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await logo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const logoUrl = `/uploads/platforms/${filename}`

    return NextResponse.json({
      success: true,
      logoUrl,
      filename,
      size: logo.size,
      type: logo.type
    })

  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}
