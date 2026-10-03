import mongoose from "mongoose";
import dotenv from "dotenv";
import { Property } from "../Models/propertyModel.js";
import { User } from "../Models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const AMENITIES = {
  Wifi: "fa-solid fa-wifi",
  Kitchen: "fa-solid fa-kitchen-set",
  Ac: "fa-solid fa-snowflake",
  "Washing Machine": "fa-solid fa-soap",
  Tv: "fa-solid fa-tv",
  Pool: "fa-solid fa-person-swimming",
  "Free Parking": "fa-solid fa-square-parking",
};

const dummyImages = Array.from({ length: 6 }).map((_, i) => ({
  public_id: `dummy_image_${i}`,
  url: `https://placehold.co/600x400/EEE/31343C?text=Placeholder+Image+${i+1}`,
}));

const seedProperties = [
  {
    propertyName: "Luxury 3 BHK Villa in Koregaon Park",
    description: "Experience ultimate luxury in this fully furnished 3 BHK villa with a private pool and garden.",
    propertyType: "House",
    roomType: "Entire Home",
    maximumGuest: 6,
    price: 8500,
    address: {
      area: "Koregaon Park",
      city: "Pune",
      state: "Maharashtra",
      pincode: 411001,
    },
    amenities: ["Wifi", "Ac", "Tv", "Pool", "Free Parking"],
  },
  {
    propertyName: "Cozy 1 BHK Flat near Marine Drive",
    description: "A beautiful sea-facing 1 BHK apartment, perfect for couples or solo travelers visiting the city.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 2,
    price: 4500,
    address: {
      area: "Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: 400020,
    },
    amenities: ["Wifi", "Kitchen", "Tv", "Ac"],
  },
  {
    propertyName: "Spacious 4 BHK Independent House",
    description: "Large 4 BHK house in a quiet neighborhood. Semi-furnished and ideal for family gatherings.",
    propertyType: "House",
    roomType: "Entire Home",
    maximumGuest: 8,
    price: 6500,
    address: {
      area: "Sula Vineyards Area",
      city: "Nashik",
      state: "Maharashtra",
      pincode: 422222,
    },
    amenities: ["Wifi", "Kitchen", "Free Parking", "Washing Machine"],
  },
  {
    propertyName: "Modern 2 BHK Apartment in CIDCO",
    description: "Newly built 2 BHK furnished flat close to the airport and local markets. Great for business travelers.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 4,
    price: 2500,
    address: {
      area: "CIDCO",
      city: "Chhatrapati Sambhajinagar",
      state: "Maharashtra",
      pincode: 431003,
    },
    amenities: ["Wifi", "Tv", "Kitchen", "Free Parking"],
  },
  {
    propertyName: "Traditional Guest House in Savedi",
    description: "Experience local hospitality in our 3-room guest house, providing home-cooked meals upon request.",
    propertyType: "Guest House",
    roomType: "Room",
    maximumGuest: 3,
    price: 1500,
    address: {
      area: "Savedi",
      city: "Ahilyanagar",
      state: "Maharashtra",
      pincode: 414003,
    },
    amenities: ["Wifi", "Free Parking", "Tv"],
  },
  {
    propertyName: "Premium 3 BHK Flat in Dharampeth",
    description: "Premium furnished 3 BHK in the heart of the city with easy access to shopping and dining.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 5,
    price: 3500,
    address: {
      area: "Dharampeth",
      city: "Nagpur",
      state: "Maharashtra",
      pincode: 440010,
    },
    amenities: ["Wifi", "Ac", "Kitchen", "Tv"],
  },
  {
    propertyName: "Tech-hub 2 BHK Apartment Whitefield",
    description: "Perfectly located near IT parks. Fully furnished with high-speed internet and working desks.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 4,
    price: 4000,
    address: {
      area: "Whitefield",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: 560066,
    },
    amenities: ["Wifi", "Ac", "Washing Machine", "Kitchen"],
  },
  {
    propertyName: "Heritage House in Banjara Hills",
    description: "A beautifully restored 3 BHK heritage home combining traditional architecture with modern amenities.",
    propertyType: "House",
    roomType: "Entire Home",
    maximumGuest: 6,
    price: 7000,
    address: {
      area: "Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: 500034,
    },
    amenities: ["Wifi", "Ac", "Free Parking", "Pool"],
  },
  {
    propertyName: "Minimalist 1 BHK Studio in Vastrapur",
    description: "Clean, minimalist studio apartment near the lake. Ideal for a relaxing weekend getaway.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 2,
    price: 2000,
    address: {
      area: "Vastrapur",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: 380015,
    },
    amenities: ["Wifi", "Tv", "Kitchen"],
  },
  {
    propertyName: "Royal 4 BHK Villa in Malviya Nagar",
    description: "Experience the royal vibe in this luxury 4 BHK villa. Comes with a private garden and a dedicated caretaker.",
    propertyType: "House",
    roomType: "Entire Home",
    maximumGuest: 10,
    price: 12000,
    address: {
      area: "Malviya Nagar",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: 302017,
    },
    amenities: ["Wifi", "Ac", "Pool", "Free Parking", "Tv", "Kitchen"],
  },
  {
    propertyName: "Budget 1 BHK in Viman Nagar",
    description: "Affordable and cozy 1 BHK flat for students and professionals. Walking distance from the airport.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 2,
    price: 1800,
    address: {
      area: "Viman Nagar",
      city: "Pune",
      state: "Maharashtra",
      pincode: 411014,
    },
    amenities: ["Wifi", "Kitchen"],
  },
  {
    propertyName: "Sea View Hotel Room in Bandra",
    description: "A premium hotel room with an uninterrupted view of the Arabian Sea.",
    propertyType: "Hotel",
    roomType: "Room",
    maximumGuest: 2,
    price: 9000,
    address: {
      area: "Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: 400050,
    },
    amenities: ["Wifi", "Ac", "Tv", "Free Parking", "Pool"],
  },
  {
    propertyName: "Serene 2 BHK House in Koramangala",
    description: "Peaceful 2 BHK independent house surrounded by trees in the bustling area of Koramangala.",
    propertyType: "House",
    roomType: "Entire Home",
    maximumGuest: 4,
    price: 3500,
    address: {
      area: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: 560034,
    },
    amenities: ["Wifi", "Washing Machine", "Kitchen"],
  },
  {
    propertyName: "Lavish 3 BHK Penthouse in Gachibowli",
    description: "Top floor 3 BHK penthouse offering panoramic views of the city skyline. Fully furnished and ultra-modern.",
    propertyType: "Flat",
    roomType: "Entire Home",
    maximumGuest: 6,
    price: 8000,
    address: {
      area: "Gachibowli",
      city: "Hyderabad",
      state: "Telangana",
      pincode: 500032,
    },
    amenities: ["Wifi", "Ac", "Tv", "Kitchen", "Washing Machine"],
  },
  {
    propertyName: "Peaceful Guest House in Navrangpura",
    description: "A tranquil guest house perfect for budget travelers and backpackers.",
    propertyType: "Guest House",
    roomType: "Room",
    maximumGuest: 2,
    price: 1200,
    address: {
      area: "Navrangpura",
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: 380009,
    },
    amenities: ["Wifi", "Free Parking"],
  }
];

const runSeed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Fetch any existing user
    let user = await User.findOne({});
    if (!user) {
      console.log("No user found. Creating a dummy user for the properties...");
      user = await User.create({
        name: "Seed User",
        email: "seeduser@example.com",
        password: "Password123!",
        phoneNumber: "9876543210"
      });
    }

    let insertedCount = 0;

    for (const propData of seedProperties) {
      // Check if property already exists by propertyName to make it idempotent
      const existing = await Property.findOne({ propertyName: propData.propertyName });
      
      if (!existing) {
        // Map amenities
        const mappedAmenities = propData.amenities.map(a => ({
          name: a,
          icon: AMENITIES[a]
        }));

        const newProperty = new Property({
          ...propData,
          amenities: mappedAmenities,
          images: dummyImages,
          userId: user._id,
        });

        await newProperty.save();
        insertedCount++;
        console.log(`+ Created: ${propData.propertyName}`);
      } else {
        console.log(`- Skipped (Already exists): ${propData.propertyName}`);
      }
    }

    console.log(`\n🎉 Seeding complete. Inserted ${insertedCount} properties.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

runSeed();
