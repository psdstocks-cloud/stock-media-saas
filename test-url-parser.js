// Test URL parser with the specific Shutterstock URL
const url = 'https://www.shutterstock.com/image-photo/landscape-misty-panorama-fantastic-dreamy-sunrise-1289741896'

// Test the Shutterstock pattern
const pattern = /shutterstock\.com\/(.*)(image-vector|image-photo|image-illustration|image|image-generated|editorial)\/([0-9a-zA-Z-_]*)-([0-9a-z]*)/
const match = url.match(pattern)

console.log('URL:', url)
console.log('Pattern:', pattern)
console.log('Match result:', match)

if (match) {
  console.log('Matched groups:')
  match.forEach((group, index) => {
    console.log(`  Group ${index}:`, group)
  })
  
  const result = {
    source: 'shutterstock',
    id: match[4],
    url: match.input || ''
  }
  console.log('Parsed result:', result)
} else {
  console.log('No match found')
}

// Test alternative pattern
const pattern2 = /shutterstock\.com\/image-photo\/[^\/]*-([0-9]+)$/
const match2 = url.match(pattern2)
console.log('\nAlternative pattern test:')
console.log('Pattern2:', pattern2)
console.log('Match2 result:', match2)
