import getGroqClient from "../ai/aiClient.js";
import { Property } from "../Models/propertyModel.js";

/**
 * Phase 1: Natural-language query → structured filters
 * Phase 2: Use MongoDB to find properties
 * Phase 3: Rank matches with an AI score and show reasons
 */
export const aiSearchProperties = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Please provide a query." });
    }

    const groq = getGroqClient();

    // Step 1: Parse query into structured filters
    const parseCompletion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are an AI property assistant. Extract filter parameters from the user's query to search a MongoDB database.
Return ONLY a raw JSON object with no markdown formatting.
Schema:
{
  "city": "string (lowercase, no spaces, optional)",
  "maxPrice": "number (optional)",
  "propertyType": "string (House, Flat, Guest House, Hotel, Anytype - optional)",
  "guests": "number (optional)",
  "amenities": ["Wifi", "Kitchen", "Ac", "Washing Machine", "Tv", "Pool", "Free Parking"] (optional array)
}
Example: "I want a flat in Mumbai under 5000 with a pool" -> {"city": "mumbai", "maxPrice": 5000, "propertyType": "Flat", "amenities": ["Pool"]}
`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    let filters = {};
    try {
      filters = JSON.parse(parseCompletion.choices[0].message.content);
    } catch (e) {
      console.error("AI filter parse error:", e);
    }

    // Step 2: Query MongoDB
    const mongoQuery = {};
    if (filters.city) mongoQuery["address.city"] = new RegExp(filters.city, "i");
    if (filters.maxPrice) mongoQuery.price = { $lte: filters.maxPrice };
    if (filters.propertyType && filters.propertyType !== "Anytype") {
      mongoQuery.propertyType = new RegExp(filters.propertyType, "i");
    }
    if (filters.guests) mongoQuery.maximumGuest = { $gte: filters.guests };
    if (filters.amenities && filters.amenities.length > 0) {
      mongoQuery["amenities.name"] = { $all: filters.amenities };
    }

    // Fallback: If too strict, loosen amenities
    let properties = await Property.find(mongoQuery).limit(20);
    if (properties.length === 0 && filters.amenities && filters.amenities.length > 0) {
      delete mongoQuery["amenities.name"];
      properties = await Property.find(mongoQuery).limit(20);
    }
    
    // Fallback 2: Just fetch 10 general properties if still none
    if (properties.length === 0) {
       properties = await Property.find({}).limit(10);
    }

    // Step 3: AI Scoring
    // Map properties to lightweight JSON for the prompt to save tokens
    const propsToScore = properties.map((p) => ({
      id: p._id.toString(),
      name: p.propertyName,
      type: p.propertyType,
      city: p.address?.city,
      price: p.price,
      guests: p.maximumGuest,
      amenities: p.amenities.map(a => a.name).join(", "),
      desc: p.description.substring(0, 100) // snippet
    }));

    const scoreCompletion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `You are an AI property ranker. The user requested: "${query}".
I will provide a list of available properties.
Score each property from 1 to 100 based on how well it matches the user's request. Provide a 1-sentence friendly 'matchReason'.
Return ONLY a JSON object containing a "results" array. Do not include markdown.
Schema: { "results": [ { "id": "property_id", "score": 95, "matchReason": "Perfect match for your budget and location!" } ] }`
        },
        {
          role: "user",
          content: JSON.stringify(propsToScore)
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" } // Using json object for reliability, wrapping array
    });

    let scores = [];
    try {
      // Groq SDK might require the root to be an object for response_format: json_object.
      // So if the model returns `{ "results": [...] }` we handle it, or raw array.
      const rawRes = scoreCompletion.choices[0].message.content;
      const parsedRes = JSON.parse(rawRes);
      scores = parsedRes.results || parsedRes; 
      if (!Array.isArray(scores)) {
         // fallback if it returned a single object keyed by IDs
         scores = Object.values(parsedRes).flat();
      }
    } catch (e) {
      console.error("AI scoring parse error:", e);
    }

    // Map scores back to property documents
    const scoredProperties = properties.map(p => {
      const scoreData = scores.find(s => s.id === p._id.toString()) || { score: 50, matchReason: "A great option for you." };
      return {
        ...p.toObject(),
        aiScore: scoreData.score,
        matchReason: scoreData.matchReason
      };
    });

    // Sort descending by score
    scoredProperties.sort((a, b) => b.aiScore - a.aiScore);

    res.status(200).json({
      success: true,
      data: scoredProperties,
      filtersParsed: filters
    });
  } catch (error) {
    console.error("AI Search Error:", error);
    res.status(500).json({ success: false, message: "AI Search failed", error: error.message });
  }
};
