import mongoose from "mongoose";
import dotenv from "dotenv";
import { Property } from "../Models/propertyModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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

const runUpdate = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find properties that have 'dummy_image_0'
    const dummyProps = await Property.find({ "images.public_id": "dummy_image_0" });
    console.log(`Found ${dummyProps.length} dummy properties to update.`);

    for (let i = 0; i < dummyProps.length; i++) {
      const prop = dummyProps[i];
      
      // Select 6 images randomly from our curated list, ensuring first is exterior-ish
      let shuffled = [...realisticImages].sort(() => 0.5 - Math.random());
      
      // Ensure we have at least 6 images
      let newImages = [];
      for (let j = 0; j < 6; j++) {
        newImages.push({
          public_id: `realistic_dummy_${i}_${j}`,
          url: shuffled[j]
        });
      }

      prop.images = newImages;
      await prop.save();
      console.log(`Updated images for: ${prop.propertyName}`);
    }

    console.log("🎉 Successfully updated all dummy properties with realistic images.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runUpdate();
