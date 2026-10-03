import dotenv from "dotenv";
dotenv.config();

const key = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
console.log("KEY starts with:", key ? key.substring(0, 10) + "..." : "MISSING");
console.log("MODEL:", model);

import Groq from "groq-sdk";
const groq = new Groq({ apiKey: key });

try {
  const c = await groq.chat.completions.create({
    model,
    max_tokens: 100,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: 'Reply with ONLY valid JSON: {"ok": true}' },
      { role: "user", content: "test" }
    ]
  });
  console.log("GROQ RESPONSE:", c.choices[0].message.content);
  console.log("DIRECT GROQ TEST: PASS");
} catch(e) {
  console.error("DIRECT GROQ ERROR:", e.message);
  console.error("Status:", e.status);
  console.log("DIRECT GROQ TEST: FAIL");
}
