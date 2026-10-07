import getGroqClient from "./aiClient.js";

const systemPrompt = `You are a travel planner for a holiday rental website in India.

Create a day-by-day trip plan from the details the user gives you.

Rules:
1. Give exactly one entry per day of the trip.
2. Each day needs a short title and 3 to 4 activities.
3. Write each activity as "Morning: ...", "Afternoon: ...", or "Evening: ...".
4. Keep the plan inside the budget the user gave, and say roughly what things cost in rupees.
5. Match the activities to the interests the user picked.
6. Only suggest places that really exist in that destination. Do not invent places.
7. Keep the language simple and friendly.
8. Do not use emojis.

Reply with ONLY this JSON shape:
{
  "summary": "two sentences about the trip",
  "days": [
    { "day": 1, "title": "short title", "activities": ["Morning: ...", "Afternoon: ...", "Evening: ..."] }
  ],
  "tips": ["short tip", "short tip", "short tip"]
}`;

const planTrip = async (trip) => {
  const tripInfo = `- Destination: ${trip.destination}
- Total Budget: Rs ${trip.budget}
- Number of Days: ${trip.days}
- Number of People: ${trip.people}
- Interests: ${trip.interests.join(", ")}`;

  const client = getGroqClient();
  const completion = await client.chat.completions.create({
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    max_tokens: 2000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: tripInfo },
    ],
  });

  let content = completion.choices[0].message.content.trim();
  // Strip any markdown code fences the model may wrap the JSON in
  content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`AI returned invalid JSON: ${err.message}. Raw content: ${content.slice(0, 200)}`);
  }
};

export { planTrip };
