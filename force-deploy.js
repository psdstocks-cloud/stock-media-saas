// Force deployment script
const { execSync } = require('child_process');

console.log('🚀 Attempting to force deployment...');

try {
  // Try to trigger a deployment by making a small change
  const timestamp = new Date().toISOString();
  const change = `// Force deployment: ${timestamp}`;
  
  // Add a comment to trigger deployment
  const fs = require('fs');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts['force-deploy'] = `echo "${change}"`;
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Package.json updated');
  console.log('📦 Committing changes...');
  
  execSync('git add package.json', { stdio: 'inherit' });
  execSync('git commit -m "Force deployment trigger"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Changes pushed to GitHub');
  console.log('⏳ Waiting for Vercel to detect changes...');
  console.log('💡 Check Vercel dashboard in a few minutes');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('💡 Please try manual deployment from Vercel dashboard');
}
