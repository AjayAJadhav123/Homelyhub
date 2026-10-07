/**
 * Test script to verify production update via HTTP
 * This can be run once you have internet connectivity
 * Or deploy this as an admin endpoint (password protected)
 */

import axios from 'axios';

const RENDER_URL = process.env.RENDER_URL || 'https://your-app.onrender.com';

async function testProductionUpdate() {
  try {
    console.log('🔍 Testing production deployment...\n');
    
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get(`${RENDER_URL}/`);
      console.log('   ✅ Server is up and running');
    } catch (error) {
      console.log('   ⚠️  Health check failed, but server might still be accessible');
    }
    
    // Test 2: Get all properties
    console.log('\n2️⃣ Fetching all properties...');
    const propertiesResponse = await axios.get(`${RENDER_URL}/api/v1/properties`);
    const properties = propertiesResponse.data.data?.properties || propertiesResponse.data;
    
    console.log(`   📊 Found ${properties.length} properties\n`);
    
    // Test 3: Analyze images
    console.log('3️⃣ Analyzing property images...\n');
    
    let totalProperties = properties.length;
    let propertiesWithUnsplash = 0;
    let propertiesWithOldImageKit = 0;
    let totalImages = 0;
    let unsplashImages = 0;
    let oldImageKitImages = 0;
    
    properties.forEach((prop, index) => {
      let hasUnsplash = false;
      let hasOldImageKit = false;
      
      console.log(`   ${index + 1}. ${prop.propertyName}`);
      console.log(`      Location: ${prop.address?.city}, ${prop.address?.state}`);
      console.log(`      Images: ${prop.images?.length || 0}`);
      
      if (prop.images && prop.images.length > 0) {
        totalImages += prop.images.length;
        
        prop.images.forEach((img, imgIdx) => {
          const isOldImageKit = img.url.includes('ik.imagekit.io');
          const isUnsplash = img.url.includes('unsplash.com');
          const isPlaceholder = img.url.includes('placehold.co');
          
          if (isOldImageKit) {
            hasOldImageKit = true;
            oldImageKitImages++;
            console.log(`         ❌ [${imgIdx}] OLD IMAGEKIT: ${img.url.substring(0, 50)}...`);
          } else if (isUnsplash) {
            hasUnsplash = true;
            unsplashImages++;
            console.log(`         ✅ [${imgIdx}] UNSPLASH: ${img.url.substring(0, 50)}...`);
          } else if (isPlaceholder) {
            console.log(`         ⚠️  [${imgIdx}] PLACEHOLDER: ${img.url.substring(0, 50)}...`);
          } else {
            console.log(`         ℹ️  [${imgIdx}] OTHER: ${img.url.substring(0, 50)}...`);
          }
        });
        
        if (hasUnsplash) propertiesWithUnsplash++;
        if (hasOldImageKit) propertiesWithOldImageKit++;
        
        console.log(`      Status: ${hasUnsplash ? '✅ UPDATED' : '❌ NEEDS UPDATE'}\n`);
      } else {
        console.log(`      ⚠️  No images\n`);
      }
    });
    
    // Summary
    console.log('═'.repeat(80));
    console.log('\n📈 SUMMARY:\n');
    console.log(`   Total Properties: ${totalProperties}`);
    console.log(`   Properties with Unsplash images: ${propertiesWithUnsplash}/${totalProperties}`);
    console.log(`   Properties with old ImageKit: ${propertiesWithOldImageKit}/${totalProperties}`);
    console.log(`   Total images: ${totalImages}`);
    console.log(`   Unsplash images: ${unsplashImages}`);
    console.log(`   Old ImageKit images: ${oldImageKitImages}`);
    
    console.log('\n✅ VERIFICATION:\n');
    const allChecks = 
      totalProperties === 15 && 
      propertiesWithUnsplash === 15 && 
      oldImageKitImages === 0;
    
    if (allChecks) {
      console.log('   🎉 ALL CHECKS PASSED!');
      console.log(`   ✓ ${totalProperties}/15 properties found`);
      console.log(`   ✓ ${propertiesWithUnsplash}/15 updated with Unsplash`);
      console.log(`   ✓ ${oldImageKitImages} old ImageKit URLs`);
    } else {
      console.log('   ⚠️  ISSUES DETECTED:\n');
      if (totalProperties !== 15) {
        console.log(`   ✗ Expected 15 properties, found ${totalProperties}`);
      }
      if (propertiesWithUnsplash !== 15) {
        console.log(`   ✗ Only ${propertiesWithUnsplash}/15 have Unsplash images`);
      }
      if (oldImageKitImages > 0) {
        console.log(`   ✗ ${oldImageKitImages} old ImageKit URLs still present`);
      }
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error testing production:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testProductionUpdate();
