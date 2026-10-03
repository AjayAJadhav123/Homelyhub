import mongoose from 'mongoose';
import { Property } from './src/Models/propertyModel.js';
import imagekit from './src/utils/ImagekitIO.js';

const sourceUrls = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?q=80&w=1380&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1474&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505691938895-1758d7def511?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687920-4e2a09be15c7?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f6d9f83?q=80&w=1470&auto=format&fit=crop"
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/homelyhub');
  console.log('Connected to DB. Uploading images to ImageKit...');

  const uploadedImages = [];

  for (let i = 0; i < sourceUrls.length; i++) {
    try {
      const res = await imagekit.upload({
        file: sourceUrls[i], // can be a URL!
        fileName: `property_seed_${i}.jpg`,
        folder: '/property_images'
      });
      uploadedImages.push({ url: res.url, public_id: res.fileId });
      console.log(`Uploaded ${i+1}/${sourceUrls.length}:`, res.url);
    } catch (err) {
      console.error('Failed to upload', sourceUrls[i], err);
    }
  }

  if (uploadedImages.length < 6) {
    console.error('Not enough images uploaded.');
    process.exit(1);
  }

  const properties = await Property.find();
  for (const property of properties) {
    const images = [];
    // pick 6 images sequentially wrapping around
    let startIndex = Math.floor(Math.random() * uploadedImages.length);
    for (let i = 0; i < 6; i++) {
      images.push(uploadedImages[(startIndex + i) % uploadedImages.length]);
    }
    property.images = images;
    await property.save();
  }

  console.log(`Updated ${properties.length} properties with real ImageKit images!`);
  process.exit(0);
}

seed().catch(console.error);
