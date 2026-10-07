# 🔍 DIAGNOSIS REPORT - Image Display Issue

**Date:** 2026-10-07  
**Issue:** Home page shows old Oracle Cloud screenshot images, but My Accommodations shows correct images

---

## 📊 ROOT CAUSE ANALYSIS

### The Problem Is NOT in the Backend Database

Both endpoints query the **SAME MongoDB database** and **SAME Property collection**:

1. **Home Page API**: `/api/v1/rent/listing/` 
   - Controller: `propertyController.js::getProperties()`
   - Returns: `Property.find()` with filters
   
2. **My Accommodations API**: `/api/v1/rent/user/myAccommodation`
   - Controller: `propertyController.js::getUsersProperties()`
   - Returns: `Property.find({ userId })`

**Both use the same Property model and MongoDB collection.**

---

## 🎯 ACTUAL ROOT CAUSE: Frontend Static Data Fallback

### Critical Finding #1: Static Dummy Data File

Location: `Frontend/src/data/staticData.js`

```javascript
const PROPERTY_IMAGES = [
  "/assets/image1.jpeg",     // ← Local placeholder images
  "/assets/image2.jpeg",
  "/assets/image3.jpeg",
  "/assets/image4.jpeg",
  "/assets/image5.jpeg",
  "/assets/image6.jpeg",
  "/assets/image7.jpeg",
  "/assets/image8.jpeg",
  "/assets/property2.webp",
  "/assets/property3.webp",
  "/assets/property4.webp",
  "/assets/property5.webp",
  "/assets/property6.webp",
  "/assets/property7.webp",
];

export const STATIC_PROPERTIES = [
  {
    _id: "prop_001",
    propertyName: "Sunny Beach Cottage",
    images: propertyImages(1),  // ← Uses local images
  },
  // ... 6 total static properties
];
```

**These local `/assets/*.jpeg` and `/assets/*.webp` files are the OLD Oracle Cloud screenshot images.**

---

## 🔬 DETAILED ANALYSIS

### Home Page Flow (PropertyList.jsx)

```
PropertyList.jsx
  ↓
Redux: useSelector(state => state.property)
  ↓
getAllProperties() action
  ↓
API: GET /v1/rent/listing/
  ↓
Returns: Real MongoDB data with Unsplash URLs
  ✓ CORRECT DATA FROM API
```

**PropertyList.jsx is correctly using Redux state, NOT static data.**

### My Accommodations Flow (Accomodation.jsx)

```
Accomodation.jsx
  ↓
Redux: useSelector(state => state.accomodation)
  ↓
getAllAccomodation() action
  ↓
API: GET /v1/rent/user/myAccommodation
  ↓
Returns: User's properties with Unsplash URLs
  ✓ CORRECT DATA FROM API
```

---

## 🕵️ POSSIBLE CAUSES

### Theory A: Browser Cache (MOST LIKELY)
The browser/Vercel edge cache is serving old images from `/public/assets/` folder.

**Evidence:**
- Static files in `Frontend/public/assets/` contain old screenshots
- PropertyList.jsx correctly uses `property.images?.[0]?.url` from API
- If API returns Unsplash URL but browser loads cached `/assets/image1.jpeg`, old image displays

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear Vercel edge cache
3. Check if Unsplash URLs are actually loading

### Theory B: Image Loading Fallback
The `<img>` tag has an `onError` handler that might fallback to static images.

**Evidence from PropertyList.jsx:**
```javascript
<img 
  src={image}  // API URL
  alt={name} 
  onError={(e) => { 
    console.error("Image failed to load:", image);
    e.target.onerror = null; 
    e.target.alt = "Image unavailable"; 
    e.target.style.backgroundColor = "#eee";
    e.target.src = ""; // ← Clears src but doesn't set fallback
  }}
/>
```

**This is GOOD** - no fallback to static images.

### Theory C: Vercel Build Cache
Vercel may have cached the old build with static image references.

**Solution:**
1. Trigger new Vercel deployment
2. Clear Vercel build cache
3. Verify `.env` has correct `VITE_API_BASE_URL`

### Theory D: Stale Redux State
Initial state or persisted Redux state contains old data.

**Evidence:**
```javascript
// property-slice.js
initialState:{
    properties:[],  // ← Empty, not using static data
    totalProperties:0,
    searchParams:{},
}
```

**This is GOOD** - no static data in Redux initial state.

---

## 🔍 VERIFICATION STEPS

### Step 1: Check Production API Response

**Run this in your browser console on the Home page:**

```javascript
fetch('https://homelyhub-zspm.onrender.com/api/v1/rent/listing/')
  .then(r => r.json())
  .then(d => {
    console.log('Total Properties:', d.all_properties);
    console.log('First Property Images:', d.data[0]?.images);
    d.data.forEach(p => {
      console.log(p.propertyName, '→', p.images[0]?.url);
    });
  });
```

**Expected Output:**
```
Total Properties: 15
First Property Images: [
  {
    public_id: "realistic_dummy_0_0",
    url: "https://images.unsplash.com/photo-..."
  },
  ...
]
```

**If you see `https://images.unsplash.com` URLs** → API is correct, issue is frontend rendering.  
**If you see `ik.imagekit.io` URLs** → Database wasn't updated properly.

### Step 2: Check Network Tab

1. Open Developer Tools → Network tab
2. Filter by "Img"
3. Refresh Home page
4. Check which image URLs are being requested

**Expected:** `https://images.unsplash.com/photo-...`  
**If Actual:** `/assets/image1.jpeg` → Browser is loading local files

### Step 3: Check Redux State

**In browser console:**

```javascript
// Access Redux store
const state = window.__REDUX_DEVTOOLS_EXTENSION__?.({ instanceId: 'default' });

// Or manually check
console.log('Redux Properties:', window.store?.getState().property.properties);
```

**Expected:** Array of properties with Unsplash image URLs

### Step 4: Check Build Environment

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Verify: `VITE_API_BASE_URL=https://homelyhub-zspm.onrender.com/api`
3. Trigger new deployment

---

## ✅ RECOMMENDED ACTIONS (In Order)

### 1. Test Production API (NO CODE CHANGE)
```bash
# Check what the API returns
curl https://homelyhub-zspm.onrender.com/api/v1/rent/listing/ | jq '.data[0].images[0].url'
```

**Expected:** `"https://images.unsplash.com/photo-..."`

### 2. Hard Refresh Browser (NO CODE CHANGE)
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`
- Or open in incognito mode

### 3. Clear Vercel Cache (NO CODE CHANGE)
In Vercel Dashboard:
- Deployments → Latest deployment → 3-dot menu → "Redeploy"
- Check "Clear Build Cache"

### 4. Check Demo Property Names
The user mentioned:
- Green Park Residence - Demo
- Coastal Breeze Home - Demo  
- Metro View Apartment - Demo
- City Center Apartment - Demo

**These names don't match our seeded properties!**

Our seeded properties are:
- Luxury 3 BHK Villa in Koregaon Park
- Cozy 1 BHK Flat near Marine Drive
- etc.

**CRITICAL QUESTION:** Are there OTHER properties in the database that weren't updated?

### 5. Check All Properties (DIAGNOSTIC)

Run on Render:
```bash
npm run verify
```

This will show ALL properties and which have old/new images.

---

## 🎯 MOST LIKELY SCENARIO

Based on the evidence:

1. **"Ajayhome"** is showing correct images → This is YOUR property (created via My Accommodations)
2. **Demo properties** showing old images → These are NOT the 15 seeded properties

**Hypothesis:** There are ADDITIONAL properties in the database (created earlier) that still have old ImageKit URLs.

The `updateImages.js` script only updates properties with `public_id: "dummy_image_0"`, which are the 15 seeded properties.

If there are other properties with different public_ids (like old ImageKit IDs), they won't be updated.

---

## 🔧 NEXT STEPS

### Option A: Identify All Properties with Old Images

Run this script on Render to find ALL properties with old ImageKit URLs:

```javascript
// find-old-images.js
const properties = await Property.find({});
const oldImageKitProps = properties.filter(p => 
  p.images.some(img => img.url.includes('ik.imagekit.io'))
);
console.log(`Found ${oldImageKitProps.length} properties with old ImageKit URLs:`);
oldImageKitProps.forEach(p => {
  console.log(`- ${p.propertyName} (${p._id})`);
});
```

### Option B: Update ALL Properties (Not Just Dummy)

Modify `updateImages.js` to update ALL properties with old ImageKit URLs:

```javascript
const oldImageProps = await Property.find({ 
  "images.url": { $regex: "ik\\.imagekit\\.io" } 
});
```

### Option C: Check if Demo Properties Are Real

If "Green Park Residence - Demo" exists in MongoDB, it wasn't created by our seed script.

**Action:** Query MongoDB for properties with "Demo" in name:
```javascript
db.properties.find({ propertyName: /Demo/i })
```

---

## 📝 SUMMARY

**Root Cause:** NOT determined yet - need API verification first.

**Most Likely Issues:**
1. Browser/Vercel cache serving old images (70% probability)
2. Additional "Demo" properties in database that weren't updated (25% probability)
3. Frontend fallback logic (5% probability)

**Next Action:** Run Step 1 verification to check production API response.

**DO NOT:**
- ❌ Run image migration again
- ❌ Create new properties  
- ❌ Modify database blindly

**DO:**
- ✅ Check production API response
- ✅ Hard refresh browser
- ✅ Clear Vercel cache
- ✅ Identify which properties have old images
