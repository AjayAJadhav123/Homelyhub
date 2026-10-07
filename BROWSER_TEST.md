# Browser Console Tests

Run these in your browser console on the **Home page** of your production site.

## Test 1: Check API Response

```javascript
// Fetch properties from production API
fetch('https://homelyhub-zspm.onrender.com/api/v1/rent/listing/')
  .then(r => r.json())
  .then(d => {
    console.log('='.repeat(80));
    console.log('📊 API RESPONSE ANALYSIS');
    console.log('='.repeat(80));
    console.log(`\nTotal Properties: ${d.all_properties}`);
    console.log(`Properties Returned: ${d.data.length}\n`);
    
    // Analyze each property
    d.data.forEach((p, idx) => {
      const firstImg = p.images?.[0]?.url || 'NO IMAGES';
      const imgType = firstImg.includes('unsplash') ? '✅ Unsplash' : 
                     firstImg.includes('ik.imagekit.io') ? '❌ Old ImageKit' :
                     firstImg.includes('placehold') ? '⚠️  Placeholder' : 'ℹ️  Other';
      
      console.log(`${idx + 1}. ${p.propertyName}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Image Type: ${imgType}`);
      console.log(`   URL: ${firstImg.substring(0, 80)}...`);
      console.log(`   Public ID: ${p.images?.[0]?.public_id || 'N/A'}\n`);
    });
    
    // Summary
    const unsplashCount = d.data.filter(p => 
      p.images?.[0]?.url?.includes('unsplash')
    ).length;
    const imagekitCount = d.data.filter(p => 
      p.images?.[0]?.url?.includes('ik.imagekit.io')
    ).length;
    
    console.log('='.repeat(80));
    console.log('📈 SUMMARY:');
    console.log(`   ✅ Unsplash images: ${unsplashCount}/${d.data.length}`);
    console.log(`   ❌ Old ImageKit images: ${imagekitCount}/${d.data.length}`);
    console.log('='.repeat(80));
    
    // Check for specific properties
    const searchNames = ['Green Park', 'Coastal Breeze', 'Metro View', 'City Center', 'Demo'];
    console.log('\n🔍 Searching for specific properties:');
    searchNames.forEach(name => {
      const found = d.data.filter(p => 
        p.propertyName.toLowerCase().includes(name.toLowerCase())
      );
      if (found.length > 0) {
        found.forEach(p => {
          const imgType = p.images?.[0]?.url?.includes('unsplash') ? '✅' : '❌';
          console.log(`   ${imgType} "${p.propertyName}"`);
        });
      }
    });
    
    return d;
  })
  .catch(err => console.error('❌ Error:', err));
```

## Test 2: Check Network Requests

```javascript
// Monitor image requests
console.log('='.repeat(80));
console.log('🌐 MONITORING IMAGE REQUESTS');
console.log('='.repeat(80));
console.log('\nOpen Network tab, filter by "Img", then check what URLs are being loaded.');
console.log('\nExpected: https://images.unsplash.com/photo-...');
console.log('If Actual: /assets/image1.jpeg → Browser cache issue');
console.log('\nRefresh the page now and check Network tab.');
```

## Test 3: Check Redux State

```javascript
// Check what's in Redux
const checkRedux = () => {
  console.log('='.repeat(80));
  console.log('🗄️  REDUX STATE CHECK');
  console.log('='.repeat(80));
  
  // Try to access Redux DevTools
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('✅ Redux DevTools detected');
    console.log('Open Redux DevTools to inspect state.property.properties');
  }
  
  // Try to access store directly (if exposed)
  if (window.store) {
    const state = window.store.getState();
    const properties = state.property?.properties || [];
    console.log(`\nProperties in Redux: ${properties.length}`);
    properties.forEach((p, idx) => {
      const imgUrl = p.images?.[0]?.url || 'NO IMAGES';
      const imgType = imgUrl.includes('unsplash') ? '✅' : 
                     imgUrl.includes('ik.imagekit.io') ? '❌' : 'ℹ️';
      console.log(`${idx + 1}. ${p.propertyName} ${imgType}`);
    });
  } else {
    console.log('⚠️  Redux store not exposed to window');
    console.log('Use Redux DevTools extension instead');
  }
};
checkRedux();
```

## Test 4: Check Rendered Images

```javascript
// Check what images are actually rendered on the page
const imgElements = document.querySelectorAll('.property img');
console.log('='.repeat(80));
console.log('🖼️  RENDERED IMAGES CHECK');
console.log('='.repeat(80));
console.log(`\nFound ${imgElements.length} property images on page:\n`);

imgElements.forEach((img, idx) => {
  const src = img.src || img.getAttribute('src');
  const imgType = src.includes('unsplash') ? '✅ Unsplash' : 
                 src.includes('assets/') ? '❌ Local Asset' :
                 src.includes('ik.imagekit.io') ? '❌ Old ImageKit' : 'ℹ️  Other';
  
  console.log(`${idx + 1}. ${imgType}`);
  console.log(`   Source: ${src.substring(0, 80)}...`);
  console.log(`   Alt: ${img.alt}`);
  console.log(`   Loaded: ${img.complete ? '✓' : '✗'}\n`);
});

const localAssets = Array.from(imgElements).filter(img => 
  (img.src || '').includes('assets/')
);
console.log('='.repeat(80));
console.log(`🚨 LOCAL ASSET IMAGES: ${localAssets.length}/${imgElements.length}`);
if (localAssets.length > 0) {
  console.log('   ↳ THIS IS THE PROBLEM! Browser is loading local cached images.');
  console.log('   ↳ Solution: Hard refresh (Ctrl+Shift+R)');
}
console.log('='.repeat(80));
```

## Test 5: Check for Demo Properties

```javascript
// Search for specific demo properties
fetch('https://homelyhub-zspm.onrender.com/api/v1/rent/listing/')
  .then(r => r.json())
  .then(d => {
    console.log('='.repeat(80));
    console.log('🔍 DEMO PROPERTIES SEARCH');
    console.log('='.repeat(80));
    
    const demoProps = d.data.filter(p => 
      p.propertyName.toLowerCase().includes('demo')
    );
    
    if (demoProps.length > 0) {
      console.log(`\n✓ Found ${demoProps.length} properties with "Demo":\n`);
      demoProps.forEach(p => {
        const imgUrl = p.images?.[0]?.url || 'NO IMAGES';
        const imgType = imgUrl.includes('unsplash') ? '✅ Unsplash' : 
                       imgUrl.includes('ik.imagekit.io') ? '❌ ImageKit' : '⚠️  Other';
        console.log(`   ${p.propertyName}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   ${imgType}: ${imgUrl.substring(0, 70)}...`);
        console.log('');
      });
    } else {
      console.log('\n✗ No properties with "Demo" found.');
      console.log('   The Demo properties might have been deleted or renamed.');
    }
    
    // Also search for the specific names mentioned
    const specificNames = [
      'Green Park Residence',
      'Coastal Breeze Home',
      'Metro View Apartment',
      'City Center Apartment'
    ];
    
    console.log('\n🔍 Searching for specific property names:\n');
    specificNames.forEach(name => {
      const found = d.data.find(p => 
        p.propertyName.toLowerCase().includes(name.toLowerCase())
      );
      if (found) {
        const imgUrl = found.images?.[0]?.url || 'NO IMAGES';
        const imgType = imgUrl.includes('unsplash') ? '✅' : 
                       imgUrl.includes('ik.imagekit.io') ? '❌' : '⚠️';
        console.log(`   ${imgType} "${found.propertyName}"`);
        console.log(`       ${imgUrl.substring(0, 70)}...`);
      } else {
        console.log(`   ✗ "${name}" not found`);
      }
    });
    console.log('\n' + '='.repeat(80));
  })
  .catch(err => console.error('❌ Error:', err));
```

## Combined Test (Run All)

```javascript
// Run all tests sequentially
(async function runAllTests() {
  console.clear();
  console.log('🧪 RUNNING COMPREHENSIVE DIAGNOSTICS\n');
  
  // Test 1: API
  console.log('1️⃣ Testing API...');
  const apiData = await fetch('https://homelyhub-zspm.onrender.com/api/v1/rent/listing/')
    .then(r => r.json());
  
  const unsplashCount = apiData.data.filter(p => 
    p.images?.[0]?.url?.includes('unsplash')
  ).length;
  const imagekitCount = apiData.data.filter(p => 
    p.images?.[0]?.url?.includes('ik.imagekit.io')
  ).length;
  
  console.log(`   API Returns: ${apiData.data.length} properties`);
  console.log(`   ✅ Unsplash: ${unsplashCount}`);
  console.log(`   ❌ ImageKit: ${imagekitCount}\n`);
  
  // Test 2: Rendered
  const imgElements = document.querySelectorAll('.property img');
  const localAssets = Array.from(imgElements).filter(img => 
    (img.src || '').includes('assets/')
  );
  const unsplashRendered = Array.from(imgElements).filter(img => 
    (img.src || '').includes('unsplash')
  );
  
  console.log('2️⃣ Checking Rendered Images...');
  console.log(`   Rendered: ${imgElements.length} images`);
  console.log(`   ✅ Unsplash: ${unsplashRendered.length}`);
  console.log(`   ❌ Local Assets: ${localAssets.length}\n`);
  
  // Diagnosis
  console.log('='.repeat(80));
  console.log('🎯 DIAGNOSIS:\n');
  
  if (imagekitCount > 0) {
    console.log('❌ BACKEND ISSUE: API returns old ImageKit URLs');
    console.log('   → Run image update script on Render');
    console.log('   → Command: npm run update-images');
  } else if (localAssets.length > 0) {
    console.log('❌ FRONTEND CACHE ISSUE: Browser loading local assets');
    console.log('   → Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)');
    console.log('   → Or open in Incognito mode');
    console.log('   → Clear Vercel cache and redeploy');
  } else if (unsplashRendered.length === imgElements.length) {
    console.log('✅ ALL GOOD: API and frontend showing Unsplash images');
  } else {
    console.log('⚠️  MIXED RESULTS: Some images correct, others not');
    console.log('   → Check Network tab for specific failing images');
  }
  console.log('='.repeat(80));
})();
```

---

## Expected Results

### If Backend Is Correct:
- API test shows all Unsplash URLs
- Rendered images show local assets
- **Solution:** Clear browser/Vercel cache

### If Backend Has Old Data:
- API test shows ImageKit URLs
- **Solution:** Run `npm run find-old-images` on Render to identify which properties need updating

### If Everything Is Correct:
- API shows Unsplash URLs
- Rendered images show Unsplash URLs
- **Issue was already resolved!**
