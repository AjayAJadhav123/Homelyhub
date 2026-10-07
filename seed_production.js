/*
 * This script is intended for manual local execution only and must never be included in deployment/build scripts.
 * DO NOT automatically execute during:
 * - npm install
 * - npm run build
 * - Vercel deployment
 * - Render deployment
 * 
 * Usage: node seed_production.js
 */

const readline = require('readline');

const API_BASE_URL = 'https://homelyhub-zspm.onrender.com/api/v1/rent';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const DEMO_PROPERTIES = [
    {
        propertyName: "Ajayhome - Demo",
        description: "Demo Property: A beautiful house in Chhatrapati Sambhajinagar with modern amenities.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "CIDCO", city: "Chhatrapati Sambhajinagar", state: "Maharashtra", pincode: 431003 },
        amenities: [{ name: "Wifi", icon: "wifi" }, { name: "Kitchen", icon: "kitchen" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 4,
        price: 2500
    },
    {
        propertyName: "Green Valley Apartment - Demo",
        description: "Demo Property: Scenic apartment surrounded by greenery in Pune.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Hinjewadi", city: "Pune", state: "Maharashtra", pincode: 411057 },
        amenities: [{ name: "Ac", icon: "air" }, { name: "Wifi", icon: "wifi" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 3,
        price: 3000
    },
    {
        propertyName: "Skyline Premium Flat - Demo",
        description: "Demo Property: Luxury high-rise flat with skyline views of Mumbai.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Bandra", city: "Mumbai", state: "Maharashtra", pincode: 400050 },
        amenities: [{ name: "Pool", icon: "pool" }, { name: "Tv", icon: "tv" }],
        checkInTime: "15:00",
        checkOutTime: "11:00",
        maximumGuest: 5,
        price: 8000
    },
    {
        propertyName: "River View Residence - Demo",
        description: "Demo Property: Peaceful residence facing the Godavari river.",
        propertyType: "House",
        roomType: "Room",
        extraInfo: "Demo sample listing.",
        address: { area: "Panchavati", city: "Nashik", state: "Maharashtra", pincode: 422003 },
        amenities: [{ name: "Wifi", icon: "wifi" }, { name: "Kitchen", icon: "kitchen" }],
        checkInTime: "13:00",
        checkOutTime: "10:00",
        maximumGuest: 2,
        price: 1800
    },
    {
        propertyName: "Royal Garden Villa - Demo",
        description: "Demo Property: Spacious villa with a private garden in Nagpur.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Civil Lines", city: "Nagpur", state: "Maharashtra", pincode: 440001 },
        amenities: [{ name: "Ac", icon: "air" }, { name: "Free Parking", icon: "local_parking" }],
        checkInTime: "14:00",
        checkOutTime: "12:00",
        maximumGuest: 6,
        price: 5500
    },
    {
        propertyName: "Modern 2BHK Home - Demo",
        description: "Demo Property: Contemporary 2BHK home ideal for families.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Garkheda", city: "Chhatrapati Sambhajinagar", state: "Maharashtra", pincode: 431005 },
        amenities: [{ name: "Wifi", icon: "wifi" }, { name: "Tv", icon: "tv" }],
        checkInTime: "12:00",
        checkOutTime: "11:00",
        maximumGuest: 4,
        price: 2200
    },
    {
        propertyName: "Lake View Apartment - Demo",
        description: "Demo Property: Overlooking the beautiful lakes of Udaipur.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Pichola", city: "Udaipur", state: "Rajasthan", pincode: 313001 },
        amenities: [{ name: "Ac", icon: "air" }, { name: "Wifi", icon: "wifi" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 3,
        price: 3500
    },
    {
        propertyName: "Urban Nest - Demo",
        description: "Demo Property: A cozy and modern nest in the heart of Bengaluru.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Koramangala", city: "Bengaluru", state: "Karnataka", pincode: 560034 },
        amenities: [{ name: "Wifi", icon: "wifi" }, { name: "Washing Machine", icon: "local_laundry_service" }],
        checkInTime: "13:00",
        checkOutTime: "11:00",
        maximumGuest: 2,
        price: 2800
    },
    {
        propertyName: "Palm Residency - Demo",
        description: "Demo Property: Relaxing residency surrounded by palm trees.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: 500034 },
        amenities: [{ name: "Pool", icon: "pool" }, { name: "Ac", icon: "air" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 4,
        price: 4500
    },
    {
        propertyName: "Sunrise Heights - Demo",
        description: "Demo Property: High-altitude apartment offering stunning sunrise views.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "SG Highway", city: "Ahmedabad", state: "Gujarat", pincode: 380060 },
        amenities: [{ name: "Tv", icon: "tv" }, { name: "Wifi", icon: "wifi" }],
        checkInTime: "14:00",
        checkOutTime: "12:00",
        maximumGuest: 5,
        price: 3200
    },
    {
        propertyName: "City Center Apartment - Demo",
        description: "Demo Property: Located right in the bustling center of New Delhi.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Connaught Place", city: "New Delhi", state: "Delhi", pincode: 110001 },
        amenities: [{ name: "Ac", icon: "air" }, { name: "Wifi", icon: "wifi" }],
        checkInTime: "15:00",
        checkOutTime: "11:00",
        maximumGuest: 3,
        price: 5000
    },
    {
        propertyName: "Coastal Breeze Home - Demo",
        description: "Demo Property: Feel the ocean breeze from this lovely coastal home.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Calangute", city: "Goa", state: "Goa", pincode: 403516 },
        amenities: [{ name: "Pool", icon: "pool" }, { name: "Free Parking", icon: "local_parking" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 6,
        price: 7000
    },
    {
        propertyName: "Green Park Residence - Demo",
        description: "Demo Property: Surrounded by nature and parks in clean Indore.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: 452010 },
        amenities: [{ name: "Wifi", icon: "wifi" }, { name: "Kitchen", icon: "kitchen" }],
        checkInTime: "13:00",
        checkOutTime: "11:00",
        maximumGuest: 4,
        price: 2400
    },
    {
        propertyName: "Metro View Apartment - Demo",
        description: "Demo Property: Easily accessible apartment with great metro connectivity.",
        propertyType: "Flat",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "T Nagar", city: "Chennai", state: "Tamil Nadu", pincode: 600017 },
        amenities: [{ name: "Ac", icon: "air" }, { name: "Wifi", icon: "wifi" }],
        checkInTime: "14:00",
        checkOutTime: "12:00",
        maximumGuest: 3,
        price: 2900
    },
    {
        propertyName: "Heritage Villa - Demo",
        description: "Demo Property: Experience royal heritage in this beautiful Jaipur villa.",
        propertyType: "House",
        roomType: "Entire Home",
        extraInfo: "Demo sample listing.",
        address: { area: "Malviya Nagar", city: "Jaipur", state: "Rajasthan", pincode: 302017 },
        amenities: [{ name: "Free Parking", icon: "local_parking" }, { name: "Ac", icon: "air" }],
        checkInTime: "14:00",
        checkOutTime: "11:00",
        maximumGuest: 8,
        price: 6000
    }
];

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
    console.log("=== Homely Hub Production Seeder ===");
    console.log("This script will authenticate with the production API and create 15 demo properties.\n");

    const email = await question("Enter your Homely Hub Email: ");
    const password = await question("Enter your Homely Hub Password: ");
    
    rl.close();

    console.log("\n[1] Authenticating...");
    let cookie = '';
    try {
        const loginRes = await fetch(`${API_BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.status && loginData.status.toLowerCase() === "success") {
            const setCookieHeader = loginRes.headers.get('set-cookie');
            if (setCookieHeader) {
                // simple parsing for the JWT cookie
                cookie = setCookieHeader.split(';')[0];
            }
            console.log("✅ Authenticated successfully.");
        } else {
            console.log("--- DIAGNOSTIC LOG ---");
            console.log("HTTP Status:", loginRes.status);
            console.log("Status Text:", loginRes.statusText);
            console.log("Response Body:", JSON.stringify({ ...loginData, user: undefined, token: undefined }));
            console.log("----------------------");
            console.error("❌ Authentication failed:", loginData.message || "Unknown error");
            return;
        }
    } catch (error) {
        console.error("❌ Authentication failed:", error.message);
        return;
    }

    console.log("\n[2] Fetching existing properties to prevent duplicates and gather reference images...");
    let existingProperties = [];
    let referenceImages = null;
    try {
        const listRes = await fetch(`${API_BASE_URL}/listing`);
        const listData = await listRes.json();
        if (listData.data) {
            existingProperties = listData.data;
            console.log(`✅ Found ${existingProperties.length} existing properties.`);
            
            // Extract at least 6 valid images from the first existing property
            const propWithImages = existingProperties.find(p => p.images && p.images.length >= 6);
            if (propWithImages) {
                referenceImages = propWithImages.images.slice(0, 6);
                console.log("✅ Using existing production ImageKit images for demo properties.");
            } else {
                console.log("❌ Could not find an existing property with at least 6 images. The API requires 6 valid ImageKit images.");
                console.log("Please create at least 1 property with 6 images manually through the UI first.");
                return;
            }
        }
    } catch (error) {
        console.error("❌ Failed to fetch existing properties:", error.message);
        return;
    }

    console.log("\n[3] Creating DEMO properties...");
    let createdCount = 0;
    let duplicateCount = 0;

    for (const demoProp of DEMO_PROPERTIES) {
        const exists = existingProperties.some(p => p.propertyName === demoProp.propertyName);
        
        if (exists) {
            console.log(`⏭️  Skipping "${demoProp.propertyName}" - Already exists.`);
            duplicateCount++;
            continue;
        }

        // Attach the reference images
        demoProp.images = referenceImages;

        try {
            const createRes = await fetch(`${API_BASE_URL}/user/newAccommodation`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cookie': cookie
                },
                body: JSON.stringify(demoProp)
            });
            const createData = await createRes.json();
            
            if (createRes.ok && createData.status === "success") {
                console.log(`✅ Created "${demoProp.propertyName}"`);
                createdCount++;
            } else {
                console.error(`❌ Failed to create "${demoProp.propertyName}":`, createData.message || "Unknown error");
            }
        } catch (error) {
            console.error(`❌ Failed to create "${demoProp.propertyName}":`, error.message);
        }
    }

    console.log("\n=== Seeding Complete ===");
    console.log(`Created: ${createdCount}`);
    console.log(`Duplicates Prevented: ${duplicateCount}`);
    console.log("Please verify on https://homelyhub-c4md.vercel.app");
}

main();
