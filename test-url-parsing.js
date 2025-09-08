// Test URL parsing
const testUrls = [
  'https://depositphotos.com/editorial/stanley-neighborhood-alexandria-egypt-182879584.html',
  'https://www.istockphoto.com/vector/atm-machine-with-a-lot-of-money-rich-concept-gm515914670-88738565'
]

const depositphotosPattern = /depositphotos\.com\/(editorial|photo|vector|illustration)\/([0-9a-z-]*)-([0-9]*)\.html/
const istockPattern = /istockphoto\.com\/(.*)gm([0-9A-Z_]*)-/

console.log('Testing Depositphotos URL:')
const depositphotosMatch = testUrls[0].match(depositphotosPattern)
console.log('Match:', depositphotosMatch)
if (depositphotosMatch) {
  console.log('Extracted ID:', depositphotosMatch[3])
}

console.log('\nTesting iStock URL:')
const istockMatch = testUrls[1].match(istockPattern)
console.log('Match:', istockMatch)
if (istockMatch) {
  console.log('Extracted ID:', istockMatch[2])
}
