// Test Nehtw API supported sites
const apiKey = process.env.NEHTW_API_KEY

if (!apiKey) {
  console.log('No NEHTW_API_KEY found in environment')
  process.exit(1)
}

async function testNehtwSites() {
  try {
    const response = await fetch('https://api.nehtw.com/stock-sites-status', {
      headers: {
        'X-Api-Key': apiKey
      }
    })
    
    const data = await response.json()
    console.log('Nehtw API Response Status:', response.status)
    console.log('Supported Sites:', Object.keys(data))
    
    // Check specific sites
    const testSites = ['depositphotos', 'istockphoto', 'shutterstock', 'adobestock']
    testSites.forEach(site => {
      if (data[site]) {
        console.log(`${site}: ${data[site].active ? 'ACTIVE' : 'INACTIVE'} - Price: ${data[site].price}`)
      } else {
        console.log(`${site}: NOT SUPPORTED`)
      }
    })
  } catch (error) {
    console.error('Error testing Nehtw sites:', error)
  }
}

testNehtwSites()
