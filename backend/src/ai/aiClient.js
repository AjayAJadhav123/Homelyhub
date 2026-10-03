import Groq from "groq-sdk";

/**
 * Returns a Groq client, creating it lazily so that environment variables
 * are read at call-time (after dotenv/dotenvx has injected them) rather than
 * at module-load time.
 *
 * Throws a descriptive Error when GROQ_API_KEY is absent or set to "dummy",
 * so callers receive a clean 503 rather than a crash.
 */
let _groqClient = null;

function getGroqClient() {
  const key = process.env.GROQ_API_KEY;

  if (!key || key === "dummy") {
    throw new Error(
      "Groq API is not configured. Please set a valid GROQ_API_KEY in your .env file."
    );
  }

  // Re-use the singleton if the key hasn't changed
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: key });
    console.log("✅ Groq client initialised with model:", process.env.GROQ_MODEL || "openai/gpt-oss-20b");
  }

  return _groqClient;
}

export default getGroqClient;