import mongoose from "mongoose";
import dotenv from "dotenv";
import { Property } from "./src/Models/propertyModel.js";

dotenv.config();

const realisticImages = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?q=80&w=1380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1474&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7def511?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09be15c7?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1470&auto=format&fit=crop"
];

const updateDemoProperties = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB\n");

    // Find properties with "Demo" in the name OR old ImageKit URLs
    const demoProps = await Property.find({
      $or: [
        { propertyName: { $regex: /demo/i } },
        { "images.url": { $regex: "ik\\.imagekit\\.io" } }
      ]
    });

    console.log(`📊 Found ${demoProps.length} properties to update:\n`);

    if (demoProps.length === 0) {
      console.log("✅ No properties need updating!");
      process.exit(0);
    }

    // List them first
    demoProps.forEach((p, idx) => {
      const firstImg = p.images?.[0]?.url || 'NO IMAGES';
      const imgType = firstImg.includes('unsplash') ? '✅ Already good' :
                     firstImg.includes('ik.imagekit.io') ? '❌ Old ImageKit' :
                     '⚠️  Other';
      console.log(`${idx + 1}. ${p.propertyName}`);
      console.log(`   Status: ${imgType}`);
      console.log(`   Current: ${firstImg.substring(0, 60)}...`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("🔄 Starting update...\n");

    let updatedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < demoProps.length; i++) {
      const prop = demoProps[i];
      
      // Skip if already has Unsplash images
      if (prop.images?.[0]?.url?.includes('unsplash')) {
        console.log(`⏭️  Skipped (already updated): ${prop.propertyName}`);
        skippedCount++;
        continue;
      }

      // Shuffle and select 6 images
      let shuffled = [...realisticImages].sort(() => 0.5 - Math.random());
      
      let newImages = [];
      for (let j = 0; j < 6; j++) {
        newImages.push({
          public_id: `realistic_demo_${Date.now()}_${i}_${j}`,
          url: shuffled[j]
        });
      }

      prop.images = newImages;
      await prop.save();
      updatedCount++;
      
      console.log(`✅ Updated: ${prop.propertyName}`);
      console.log(`   New image: ${newImages[0].url.substring(0, 60)}...`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("\n📈 SUMMARY:");
    console.log(`   Total found: ${demoProps.length}`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped (already good): ${skippedCount}`);
    
    if (updatedCount > 0) {
      console.log("\n🎉 Successfully updated demo properties with realistic images!");
    } else {
      console.log("\n✨ All properties already have good images!");
    }
    
    console.log("\nℹ️  Run 'npm run verify' to confirm all properties are updated.");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
};

updateDemoProperties();
