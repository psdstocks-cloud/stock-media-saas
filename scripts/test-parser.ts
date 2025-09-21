#!/usr/bin/env tsx

/**
 * URL Parser Test Script
 * Tests the comprehensive URL parser with various stock media site URLs
 */

import { parseStockMediaUrl, testUrlParsing, getSupportedSites } from '../src/lib/url-parser';

// Test URLs from various stock media sites
const testUrls = [
  // Shutterstock URLs
  'https://www.shutterstock.com/image-photo/aerial-sunset-view-skyline-london-skyscrapers-2467146017',
  'https://shutterstock.com/image-vector/abstract-geometric-background-1234567890',
  'https://www.shutterstock.com/video/clip-1234567890',
  
  // Getty Images URLs
  'https://www.gettyimages.com/detail/photo/beautiful-landscape-1234567890',
  'https://gettyimages.com/detail/illustration/vector-icon-1234567890',
  
  // Adobe Stock URLs
  'https://stock.adobe.com/images/beautiful-sunset-1234567890',
  'https://adobe.com/stock/photo/mountain-landscape-1234567890',
  
  // Unsplash URLs
  'https://unsplash.com/photos/beautiful-mountain-landscape-1234567890',
  'https://unsplash.com/@photographer/photo/1234567890',
  
  // Pexels URLs
  'https://www.pexels.com/photo/beautiful-nature-1234567890/',
  'https://pexels.com/photo/urban-cityscape-1234567890/',
  
  // Pixabay URLs
  'https://pixabay.com/photos/beautiful-flower-1234567890/',
  'https://pixabay.com/vectors/abstract-design-1234567890/',
  
  // Depositphotos URLs
  'https://depositphotos.com/1234567890/stock-photo-beautiful-landscape.html',
  'https://depositphotos.com/vector/1234567890/abstract-design.html',
  
  // 123RF URLs
  'https://www.123rf.com/stock-photo/beautiful-nature-1234567890.html',
  'https://123rf.com/stock-photo/urban-architecture-1234567890.html',
  
  // Dreamstime URLs
  'https://www.dreamstime.com/stock-photo-beautiful-landscape-1234567890',
  'https://dreamstime.com/stock-photo-urban-cityscape-1234567890',
  
  // iStock URLs
  'https://www.istockphoto.com/photo/beautiful-mountain-1234567890',
  'https://istockphoto.com/photo/urban-architecture-1234567890',
  
  // Freepik URLs
  'https://www.freepik.com/photos/beautiful-landscape-1234567890',
  'https://freepik.com/vectors/abstract-design-1234567890',
  
  // Pond5 URLs
  'https://www.pond5.com/stock-footage/1234567890/beautiful-nature',
  'https://pond5.com/stock-footage/1234567890/urban-cityscape',
  
  // Storyblocks URLs
  'https://www.storyblocks.com/video/1234567890/beautiful-landscape',
  'https://storyblocks.com/audio/1234567890/ambient-sound',
  
  // Envato Elements URLs
  'https://elements.envato.com/beautiful-landscape-1234567890',
  'https://envato.com/photo/urban-architecture-1234567890',
  
  // Canva URLs
  'https://www.canva.com/design/1234567890/beautiful-poster',
  'https://canva.com/design/1234567890/abstract-background',
  
  // Vecteezy URLs
  'https://www.vecteezy.com/vector-art/1234567890/abstract-design',
  'https://vecteezy.com/vector-art/1234567890/geometric-pattern',
  
  // Bigstock URLs
  'https://www.bigstockphoto.com/image-1234567890/beautiful-landscape',
  'https://bigstockphoto.com/image-1234567890/urban-architecture',
  
  // Alamy URLs
  'https://www.alamy.com/stock-photo-1234567890/beautiful-nature.html',
  'https://alamy.com/stock-photo-1234567890/urban-cityscape.html',
  
  // Rawpixel URLs
  'https://www.rawpixel.com/image/1234567890/beautiful-landscape',
  'https://rawpixel.com/image/1234567890/abstract-design',
  
  // Flaticon URLs
  'https://www.flaticon.com/free-icon/1234567890/beautiful-icon',
  'https://flaticon.com/free-icon/1234567890/abstract-icon',
  
  // IconScout URLs
  'https://iconscout.com/icon/1234567890/beautiful-icon',
  'https://iconscout.com/icon/1234567890/abstract-icon',
  
  // Motion Array URLs
  'https://www.motionarray.com/stock-video/1234567890/beautiful-animation',
  'https://motionarray.com/stock-video/1234567890/abstract-motion',
  
  // Videoblocks URLs
  'https://www.videoblocks.com/video/1234567890/beautiful-footage',
  'https://videoblocks.com/video/1234567890/urban-footage',
  
  // Epidemic Sound URLs
  'https://www.epidemicsound.com/track/1234567890/beautiful-music',
  'https://epidemicsound.com/track/1234567890/ambient-sound',
  
  // Soundstripe URLs
  'https://www.soundstripe.com/track/1234567890/beautiful-music',
  'https://soundstripe.com/track/1234567890/ambient-sound',
  
  // Artlist URLs
  'https://www.artlist.io/track/1234567890/beautiful-music',
  'https://artlist.io/track/1234567890/ambient-sound',
  
  // Creative Fabrica URLs
  'https://www.creativefabrica.com/product/1234567890/beautiful-font',
  'https://creativefabrica.com/product/1234567890/abstract-pattern',
  
  // Craftwork URLs
  'https://craftwork.design/1234567890/beautiful-ui-kit',
  'https://craftwork.design/1234567890/abstract-illustration',
  
  // UI8 URLs
  'https://ui8.net/products/1234567890/beautiful-ui-kit',
  'https://ui8.net/products/1234567890/abstract-illustration',
  
  // Pixeden URLs
  'https://www.pixeden.com/psd-templates/1234567890/beautiful-template',
  'https://pixeden.com/psd-templates/1234567890/abstract-design',
  
  // Pixel Buddha URLs
  'https://pixelbuddha.net/freebies/1234567890/beautiful-ui-kit',
  'https://pixelbuddha.net/freebies/1234567890/abstract-illustration',
  
  // Pixelsquid URLs
  'https://www.pixelsquid.com/png/1234567890/beautiful-3d-model',
  'https://pixelsquid.com/png/1234567890/abstract-3d-object',
  
  // Footage Crate URLs
  'https://www.footagecrate.com/video/1234567890/beautiful-footage',
  'https://footagecrate.com/video/1234567890/abstract-motion',
  
  // Yellow Images URLs
  'https://yellowimages.com/stock/1234567890/beautiful-illustration',
  'https://yellowimages.com/stock/1234567890/abstract-design',
  
  // Invalid URLs for testing error handling
  'https://example.com/invalid-url',
  'not-a-url',
  'https://unsupported-site.com/image/123',
  '',
  'https://shutterstock.com/invalid-path',
];

interface TestResult {
  url: string;
  success: boolean;
  source?: string;
  id?: string;
  error?: string;
  details?: any;
}

function runTests(): TestResult[] {
  console.log('🧪 Starting URL Parser Tests...\n');
  
  const results: TestResult[] = [];
  let successCount = 0;
  let failureCount = 0;
  
  // Test each URL
  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    
    const testResult = testUrlParsing(url);
    const result: TestResult = {
      url,
      success: testResult.result.success,
      source: testResult.result.data?.source,
      id: testResult.result.data?.id,
      error: testResult.result.error,
      details: testResult.details
    };
    
    results.push(result);
    
    if (result.success) {
      console.log(`✅ SUCCESS: ${result.source} - ${result.id}`);
      successCount++;
    } else {
      console.log(`❌ FAILED: ${result.error}`);
      failureCount++;
    }
    
    console.log('---');
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${((successCount / testUrls.length) * 100).toFixed(1)}%`);
  
  // Show supported sites
  console.log('\n🌐 Supported Sites:');
  const supportedSites = getSupportedSites();
  console.log(supportedSites.join(', '));
  
  // Group results by source
  console.log('\n📋 Results by Source:');
  const resultsBySource = results.reduce((acc, result) => {
    if (result.success && result.source) {
      acc[result.source] = (acc[result.source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(resultsBySource).forEach(([source, count]) => {
    console.log(`${source}: ${count} successful`);
  });
  
  // Show failed URLs
  const failedUrls = results.filter(r => !r.success);
  if (failedUrls.length > 0) {
    console.log('\n❌ Failed URLs:');
    failedUrls.forEach(result => {
      console.log(`- ${result.url}: ${result.error}`);
    });
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  try {
    const results = runTests();
    
    // Exit with error code if there are failures
    const hasFailures = results.some(r => !r.success);
    if (hasFailures) {
      console.log('\n⚠️  Some tests failed. Check the results above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  }
}

export { runTests, testUrls };
