// Script to populate website status data via API
// This will work with the production database

const API_BASE = 'https://stock-media-saas.vercel.app'

async function populateWebsiteStatus() {
  console.log('🌱 Populating website status data...')

  try {
    // First, let's check if we can access the API
    const healthResponse = await fetch(`${API_BASE}/api/health`)
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`)
    }
    console.log('✅ API is accessible')

    // Get current website status
    const statusResponse = await fetch(`${API_BASE}/api/website-status`)
    if (!statusResponse.ok) {
      throw new Error(`Status API failed: ${statusResponse.status}`)
    }
    
    const statusData = await statusResponse.json()
    console.log('📊 Current status:', statusData)

    if (statusData.sites && statusData.sites.length > 0) {
      console.log(`✅ Found ${statusData.sites.length} websites already configured`)
      statusData.sites.forEach((site: any) => {
        console.log(`   - ${site.displayName}: ${site.status}`)
      })
    } else {
      console.log('❌ No websites found in database')
      console.log('💡 The database needs to be seeded with stock sites data')
      console.log('   This should be done through the admin panel or database seeding')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

populateWebsiteStatus()
