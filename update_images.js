const readline = require('readline');

const API_BASE_URL = 'https://homelyhub-zspm.onrender.com/api/v1/rent';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Collection of valid Unsplash real estate images
const H1 = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const H2 = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const H3 = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const H4 = "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const H5 = "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const H6 = "https://images.unsplash.com/photo-1600607687644-aac4c1566903?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const A1 = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const A2 = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const A3 = "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const A4 = "https://images.unsplash.com/photo-1502672260266-1c1de24244fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const A5 = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
const A6 = "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const L1 = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Luxury
const L2 = "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Modern
const L3 = "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Premium
const L4 = "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Villa
const L5 = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Exterior
const L6 = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Villa 2

const R1 = "https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Nature/River
const R2 = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Coastal
const R3 = "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Beach house
const R4 = "https://images.unsplash.com/photo-1432303492674-642e9d0944b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // River view
const R5 = "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Lake view
const R6 = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // Resort

const PROPERTY_IMAGES = {
    "Ajayhome - Demo": [H1, H2, H3, H4, H5, H6],
    "Green Valley Apartment - Demo": [A1, A2, A3, L2, L3, A6],
    "Skyline Premium Flat - Demo": [L1, L2, L3, A4, A5, A6],
    "River View Residence - Demo": [R1, R4, R5, H4, H5, H6],
    "Royal Garden Villa - Demo": [L4, L5, L6, H1, H2, H3],
    "Modern 2BHK Home - Demo": [H4, H5, H6, H1, H2, H3],
    "Lake View Apartment - Demo": [R5, A1, A2, A3, A4, A5],
    "Urban Nest - Demo": [A6, A5, A4, A3, A2, A1],
    "Palm Residency - Demo": [L2, L3, L4, L5, L6, H1],
    "Sunrise Heights - Demo": [A3, A4, A5, A6, A1, A2],
    "City Center Apartment - Demo": [A1, A3, A5, H2, H4, H6],
    "Coastal Breeze Home - Demo": [R2, R3, R6, L1, L2, L3],
    "Green Park Residence - Demo": [H1, A1, H2, A2, H3, A3],
    "Metro View Apartment - Demo": [A4, A2, A6, H1, H3, H5],
    "Heritage Villa - Demo": [L1, L4, L5, R1, R5, R6]
};

const mapUrlsToImageObjects = (urls) => {
    return urls.map(url => ({ public_id: "url", url }));
};

async function main() {
    console.log("=== Update Production Demo Property Images ===");

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
                cookie = setCookieHeader.split(';')[0];
            }
            console.log("✅ Authenticated successfully.");
        } else {
            console.error("❌ Authentication failed");
            return;
        }
    } catch (error) {
        console.error("❌ Authentication failed:", error.message);
        return;
    }

    console.log("\n[2] Fetching existing properties...");
    let existingProperties = [];
    try {
        const listRes = await fetch(`${API_BASE_URL}/listing?limit=50`);
        const listData = await listRes.json();
        if (listData.data) {
            existingProperties = listData.data;
            console.log(`✅ Found ${existingProperties.length} existing properties.`);
        }
    } catch (error) {
        console.error("❌ Failed to fetch existing properties:", error.message);
        return;
    }

    console.log("\n[3] Updating DEMO properties with unique images...");
    let updatedCount = 0;
    let failedCount = 0;

    for (const propName of Object.keys(PROPERTY_IMAGES)) {
        const prop = existingProperties.find(p => p.propertyName === propName);
        if (!prop) {
            console.log(`⏭️  Skipping "${propName}" - Not found in DB.`);
            continue;
        }

        const newImages = mapUrlsToImageObjects(PROPERTY_IMAGES[propName]);

        try {
            const updateRes = await fetch(`${API_BASE_URL}/user/accommodation/${prop._id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cookie': cookie
                },
                body: JSON.stringify({ images: newImages })
            });
            const updateData = await updateRes.json();
            
            if (updateRes.ok && updateData.status === "success") {
                console.log(`✅ Updated "${propName}" (ID: ${prop._id})`);
                updatedCount++;
            } else {
                console.error(`❌ Failed to update "${propName}":`, updateData.message || "Unknown error");
                failedCount++;
            }
        } catch (error) {
            console.error(`❌ Failed to update "${propName}":`, error.message);
            failedCount++;
        }
    }

    console.log("\n=== Update Complete ===");
    console.log(`15/15 properties updated: ${updatedCount === 15 ? 'YES' : 'NO'}`);
    console.log(`Images are hosted on: Unsplash directly (HTTPS URLs)`);
    console.log(`Updated successfully: ${updatedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log("Please verify on https://homelyhub-c4md.vercel.app");
}

main();
