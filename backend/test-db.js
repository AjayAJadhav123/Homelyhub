import mongoose from 'mongoose';
import { Property } from './src/Models/propertyModel.js';
import dotenv from 'dotenv';
dotenv.config();

async function testDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
        
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        const propertyId = '6ac0cf695f77bf324e422f38';
        const property = await Property.findById(propertyId);
        
        if (property) {
            console.log('Property found:', property._id);
        } else {
            console.log('Property NOT found for ID:', propertyId);
            const firstProp = await Property.findOne();
            if (firstProp) {
                console.log('Use this valid Property ID instead:', firstProp._id);
            } else {
                console.log('No properties exist in the local database.');
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
testDB();
