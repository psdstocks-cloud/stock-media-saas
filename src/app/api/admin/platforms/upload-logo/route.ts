import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'node:fs'

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ Logo upload API called')
    
    const formData = await request.formData()
    const logo = formData.get('logo') as File
    const platformName = formData.get('platformName') as string
    const logoSize = formData.get('logoSize') as string

    console.log('📝 Form data received:', {
      hasLogo: !!logo,
      logoName: logo?.name,
      logoSize: logo?.size,
      logoType: logo?.type,
      platformName,
      logoSize
    })

    if (!logo) {
      console.log('❌ No logo file provided')
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 })
    }

    if (!platformName) {
      console.log('❌ Platform name is required')
      return NextResponse.json({ error: 'Platform name is required' }, { status: 400 })
    }

    // Validate file type
    if (!logo.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', logo.type)
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (logo.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', logo.size)
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'platforms')
    console.log('📁 Upload directory:', uploadsDir)
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creating upload directory...')
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = logo.name.split('.').pop()
    const filename = `${platformName}-${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    
    console.log('💾 Saving file:', { filename, filepath })

    // Convert file to buffer and save
    const bytes = await logo.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return the public URL
    const logoUrl = `/uploads/platforms/${filename}`
    
    console.log('✅ Logo uploaded successfully:', { logoUrl, filename, size: logo.size })

    return NextResponse.json({
      success: true,
      logoUrl,
      filename,
      size: logo.size,
      type: logo.type
    })

  } catch (error) {
    console.error('❌ Error uploading logo:', error)
    console.error('❌ Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload logo',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}
