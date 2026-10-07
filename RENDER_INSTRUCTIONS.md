# Running Update Script on Render

Since there's no local internet connectivity, you need to run the update script directly on your Render deployment.

## Option 1: Using Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service
3. Click on "Shell" tab in the left sidebar
4. Run the following commands:

```bash
# Navigate to your app directory (usually /opt/render/project/src)
cd /opt/render/project/src

# Run the update images script
node src/seed/updateImages.js

# Verify the updates
node verify-properties.js
```

## Option 2: Create a Manual Deploy Trigger

Add this script to your package.json and trigger it via Render:

```json
"scripts": {
  "update-images": "node src/seed/updateImages.js",
  "verify": "node verify-properties.js"
}
```

Then run in Render Shell:
```bash
npm run update-images
npm run verify
```

## Option 3: SSH into Render (if enabled)

If you have SSH access enabled:

```bash
# SSH into your Render instance
ssh <your-render-ssh-command>

# Run the scripts
cd /opt/render/project/src
node src/seed/updateImages.js
node verify-properties.js
```

## Expected Output

### Update Script Output:
```
✅ Connected to MongoDB
Found 15 dummy properties to update.
Updated images for: Luxury 3 BHK Villa in Koregaon Park
Updated images for: Cozy 1 BHK Flat near Marine Drive
... (all 15 properties)
🎉 Successfully updated all dummy properties with realistic images.
```

### Verification Script Output:
```
✅ VERIFICATION STATUS:
   🎉 ALL CHECKS PASSED!
   ✓ 15/15 properties found
   ✓ 15/15 updated with Unsplash images
   ✓ 0 old ImageKit URLs remaining
```

## What the Scripts Do

### updateImages.js
- Finds all properties with dummy images (public_id: "dummy_image_0")
- Replaces them with 6 unique Unsplash images per property
- Each property gets distinct images from a pool of 10 Unsplash URLs
- Saves the changes to MongoDB

### verify-properties.js
- Fetches all 15 properties from MongoDB
- Checks each property's images
- Counts Unsplash URLs vs old ImageKit URLs
- Provides detailed analysis per property
- Confirms all 15 properties are updated correctly

## Troubleshooting

If you see connection errors:
1. Verify MONGO_URI is set in Render environment variables
2. Check MongoDB Atlas whitelist includes Render's IP addresses (or use 0.0.0.0/0 for all IPs)
3. Verify database credentials are correct

If properties aren't found:
1. Run the seed script first: `node src/seed/properties.js`
2. Then run the update script

## Next Steps

After running both scripts successfully:
1. Test the frontend to see the new images
2. Verify no duplicate properties were created
3. Confirm each property has its own distinct image set
