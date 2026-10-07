# Quick Start - Update Production Images

## ⚡ Fast Track (Run on Render Shell)

```bash
# Step 1: Update images
npm run update-images

# Step 2: Verify updates
npm run verify
```

That's it! ✅

## 📋 What Gets Updated

- **15 properties** in production MongoDB
- **6 images per property** = 90 total images
- Old dummy/ImageKit URLs → New Unsplash URLs
- Each property gets unique images

## ✅ Success Indicators

After running, you should see:
- `🎉 Successfully updated all dummy properties with realistic images.`
- `✅ ALL CHECKS PASSED!`
- `✓ 15/15 properties updated`
- `✓ 0 old ImageKit URLs`

## 🔧 Alternative Methods

### Method 1: Direct Node Commands
```bash
node src/seed/updateImages.js
node verify-properties.js
```

### Method 2: HTTP Test (once internet is back)
```bash
# Set your Render URL
export RENDER_URL=https://your-app.onrender.com

# Test via API
node test-production-update.js
```

## 📊 Files Created/Updated

1. ✅ `src/seed/updateImages.js` - Enhanced with better logging
2. ✅ `verify-properties.js` - New verification script
3. ✅ `test-production-update.js` - HTTP-based testing
4. ✅ `package.json` - Added npm scripts
5. ✅ `.env` - Created from example

## 🚨 Important Notes

- ✅ No duplicates will be created
- ✅ Payment flow NOT executed
- ✅ Scripts are idempotent (safe to re-run)
- ✅ Only images are updated, other data intact

## 📞 Need Help?

- Check `DEPLOYMENT_CHECKLIST.md` for detailed steps
- Check `RENDER_INSTRUCTIONS.md` for Render-specific guidance
- Look at script output for specific error messages

## 🎯 Your Goal

Verify these 5 points:
1. ✓ 15/15 properties updated
2. ✓ 15/15 persisted in MongoDB  
3. ✓ old ik.imagekit.io URLs = 0
4. ✓ new Unsplash URLs present
5. ✓ each property has distinct images

Run `npm run verify` to check all of these automatically!
