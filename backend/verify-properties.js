import mongoose from "mongoose";
import dotenv from "dotenv";
import { Property } from "./src/Models/propertyModel.js";

dotenv.config();

const verifyProperties = async () => {
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
    console.log("✅ Connected to MongoDB");

    // Get all properties
    const properties = await Property.find({}).lean();
    console.log(`\n📊 Total properties found: ${properties.length}`);

    if (properties.length === 0) {
      console.log("⚠️  No properties in database");
      process.exit(0);
    }

    let updatedCount = 0;
    let oldImageKitCount = 0;
    let unsplashCount = 0;
    let propertiesWithUnsplash = 0;

    console.log("\n🔍 Detailed Property Analysis:\n");
    console.log("=" .repeat(80));

    properties.forEach((prop, index) => {
      console.log(`\n${index + 1}. ${prop.propertyName}`);
      console.log(`   Location: ${prop.address.city}, ${prop.address.state}`);
      console.log(`   Images (${prop.images.length}):`);

      let hasOldImageKit = false;
      let hasUnsplash = false;
      let imageDetails = [];

      prop.images.forEach((img, imgIdx) => {
        const isOldImageKit = img.url.includes("ik.imagekit.io");
        const isUnsplash = img.url.includes("unsplash.com");
        const isRealisticDummy = img.public_id?.includes("realistic_dummy");

        if (isOldImageKit) {
          hasOldImageKit = true;
          oldImageKitCount++;
        }
        if (isUnsplash) {
          hasUnsplash = true;
          unsplashCount++;
        }
        if (isRealisticDummy) {
          updatedCount++;
        }

        imageDetails.push({
          index: imgIdx,
          publicId: img.public_id,
          urlType: isOldImageKit ? "OLD_IMAGEKIT" : isUnsplash ? "UNSPLASH" : "OTHER",
          url: img.url.substring(0, 60) + "..."
        });
      });

      if (hasUnsplash) propertiesWithUnsplash++;

      imageDetails.forEach(detail => {
        const emoji = detail.urlType === "UNSPLASH" ? "✅" : 
                     detail.urlType === "OLD_IMAGEKIT" ? "❌" : "ℹ️";
        console.log(`     ${emoji} [${detail.index}] ${detail.publicId} (${detail.urlType})`);
      });

      console.log(`   Status: ${hasUnsplash ? "✅ UPDATED" : "❌ NOT UPDATED"}`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("\n📈 SUMMARY:");
    console.log(`   Total Properties: ${properties.length}`);
    console.log(`   Properties with Unsplash images: ${propertiesWithUnsplash}/${properties.length}`);
    console.log(`   Total Unsplash image URLs: ${unsplashCount}`);
    console.log(`   Old ik.imagekit.io URLs remaining: ${oldImageKitCount}`);
    console.log(`   Updated image records (realistic_dummy): ${updatedCount}`);

    console.log("\n✅ VERIFICATION STATUS:");
    if (properties.length === 15 && 
        propertiesWithUnsplash === 15 && 
        oldImageKitCount === 0) {
      console.log("   🎉 ALL CHECKS PASSED!");
      console.log("   ✓ 15/15 properties found");
      console.log("   ✓ 15/15 updated with Unsplash images");
      console.log("   ✓ 0 old ImageKit URLs remaining");
    } else {
      console.log("   ⚠️  ISSUES DETECTED:");
      if (properties.length !== 15) {
        console.log(`   ✗ Expected 15 properties, found ${properties.length}`);
      }
      if (propertiesWithUnsplash !== 15) {
        console.log(`   ✗ Only ${propertiesWithUnsplash}/15 properties have Unsplash images`);
      }
      if (oldImageKitCount > 0) {
        console.log(`   ✗ ${oldImageKitCount} old ImageKit URLs still present`);
      }
    }

    console.log("\n");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

verifyProperties();
