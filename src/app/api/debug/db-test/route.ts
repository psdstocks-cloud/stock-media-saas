import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET() {
  let client: Client | null = null
  
  try {
    console.log('Testing direct PostgreSQL connection...')
    
    // Create a direct PostgreSQL client
    client = new Client({
      connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
    })
    
    await client.connect()
    console.log('Connected to PostgreSQL successfully')
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time')
    console.log('Query result:', result.rows[0])
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time
    })
    
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    if (client) {
      await client.end()
    }
  }
}
