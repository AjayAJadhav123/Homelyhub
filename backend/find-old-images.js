import mongoose from "mongoose";
import dotenv from "dotenv";
import { Property } from "./src/Models/propertyModel.js";

dotenv.config();

const findOldImages = async () => {
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

    // Get ALL properties
    const allProperties = await Property.find({}).lean();
    console.log(`📊 Total properties in database: ${allProperties.length}\n`);

    // Categorize by image source
    const unsplashProps = [];
    const imageKitProps = [];
    const placeholderProps = [];
    const otherProps = [];

    allProperties.forEach(prop => {
      const firstImageUrl = prop.images?.[0]?.url || '';
      
      if (firstImageUrl.includes('unsplash.com')) {
        unsplashProps.push(prop);
      } else if (firstImageUrl.includes('ik.imagekit.io')) {
        imageKitProps.push(prop);
      } else if (firstImageUrl.includes('placehold')) {
        placeholderProps.push(prop);
      } else {
        otherProps.push(prop);
      }
    });

    console.log("=" .repeat(80));
    console.log("🔍 PROPERTIES BY IMAGE SOURCE:\n");

    console.log(`✅ Unsplash Images (GOOD): ${unsplashProps.length}`);
    unsplashProps.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.propertyName}`);
      console.log(`      ID: ${p._id}`);
      console.log(`      First Image: ${p.images[0]?.url.substring(0, 70)}...`);
      console.log(`      Public ID: ${p.images[0]?.public_id}`);
    });

    console.log(`\n❌ Old ImageKit Images (NEED UPDATE): ${imageKitProps.length}`);
    imageKitProps.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.propertyName}`);
      console.log(`      ID: ${p._id}`);
      console.log(`      First Image: ${p.images[0]?.url}`);
      console.log(`      Public ID: ${p.images[0]?.public_id}`);
    });

    console.log(`\n⚠️  Placeholder Images: ${placeholderProps.length}`);
    placeholderProps.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.propertyName}`);
      console.log(`      ID: ${p._id}`);
      console.log(`      First Image: ${p.images[0]?.url}`);
    });

    console.log(`\nℹ️  Other Image Sources: ${otherProps.length}`);
    otherProps.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.propertyName}`);
      console.log(`      ID: ${p._id}`);
      console.log(`      First Image: ${p.images[0]?.url || 'NO IMAGES'}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("\n📈 SUMMARY:");
    console.log(`   Total Properties: ${allProperties.length}`);
    console.log(`   ✅ Updated (Unsplash): ${unsplashProps.length}`);
    console.log(`   ❌ Old (ImageKit): ${imageKitProps.length}`);
    console.log(`   ⚠️  Placeholder: ${placeholderProps.length}`);
    console.log(`   ℹ️  Other: ${otherProps.length}`);

    // Check for Demo properties specifically
    console.log("\n" + "=".repeat(80));
    console.log("\n🔍 SEARCHING FOR 'DEMO' PROPERTIES:\n");
    
    const demoProps = allProperties.filter(p => 
      p.propertyName.toLowerCase().includes('demo')
    );

    if (demoProps.length > 0) {
      console.log(`Found ${demoProps.length} properties with 'Demo' in name:`);
      demoProps.forEach((p, idx) => {
        console.log(`\n   ${idx + 1}. ${p.propertyName}`);
        console.log(`      ID: ${p._id}`);
        console.log(`      Images: ${p.images?.length || 0}`);
        if (p.images?.[0]) {
          const url = p.images[0].url;
          const imageType = url.includes('unsplash') ? '✅ Unsplash' : 
                           url.includes('ik.imagekit.io') ? '❌ Old ImageKit' :
                           url.includes('placehold') ? '⚠️  Placeholder' : 'ℹ️  Other';
          console.log(`      Image Type: ${imageType}`);
          console.log(`      URL: ${url.substring(0, 80)}...`);
        }
      });
    } else {
      console.log("   No properties with 'Demo' in name found.");
    }

    // Check for specific property names mentioned by user
    console.log("\n" + "=".repeat(80));
    console.log("\n🔍 SEARCHING FOR SPECIFIC PROPERTIES:\n");

    const searchNames = [
      "Green Park Residence",
      "Coastal Breeze Home",
      "Metro View Apartment",
      "City Center Apartment",
      "Ajayhome"
    ];

    searchNames.forEach(name => {
      const found = allProperties.filter(p => 
        p.propertyName.toLowerCase().includes(name.toLowerCase())
      );
      
      if (found.length > 0) {
        found.forEach(p => {
          console.log(`\n   ✓ Found: ${p.propertyName}`);
          console.log(`     ID: ${p._id}`);
          const url = p.images?.[0]?.url || 'NO IMAGES';
          const imageType = url.includes('unsplash') ? '✅ Unsplash' : 
                           url.includes('ik.imagekit.io') ? '❌ Old ImageKit' :
                           url.includes('placehold') ? '⚠️  Placeholder' : 'ℹ️  Other';
          console.log(`     Image Type: ${imageType}`);
          console.log(`     URL: ${url.substring(0, 80)}...`);
        });
      } else {
        console.log(`   ✗ Not found: ${name}`);
      }
    });

    console.log("\n");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

findOldImages();
