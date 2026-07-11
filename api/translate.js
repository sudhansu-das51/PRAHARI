// api/translate.js
// -----------------------------------------------------------
// Vercel SERVERLESS FUNCTION — ye browser me nahi, Vercel ke
// server pe chalti hai. Isliye yahan API key use karna safe hai.
//
// Kaam: English cyclone alert -> simple Odia/Hindi.
// Frontend (useTranslation hook) isko POST karta hai, ye Groq
// ko call karke translation wapas bhejta hai.
//
// Flow:
//   browser -> POST /api/translate -> [ye file] -> Groq -> wapas browser
//
// GROQ_API_KEY Vercel ke Environment Variables me set hona chahiye
// (Dashboard -> Project -> Settings -> Environment Variables).
// Local pe `vercel dev` ke liye .env.local me.
// -----------------------------------------------------------

export default async function handler(req, res) {
  // Sirf POST allow karo. GET/PUT etc pe seedha mana kar do.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Frontend se aaya data nikalo. req.body me { text, language } hona chahiye.
  const { text, language } = req.body || {};

  // ---- Validation: garbage input ko yahin rok do ----
  // Sirf odia/hindi allowed. Aur text hona chahiye.
  if (!text || !["odia", "hindi"].includes(language)) {
    return res
      .status(400)
      .json({ error: "Need { text, language: odia|hindi }" });
  }
  // Bahut lamba text = zyada tokens = paisa + abuse risk. 800 char cap.
  if (text.length > 800) {
    return res.status(400).json({ error: "Text too long" });
  }

  // Groq ko batao kaunsi script me chahiye (native script me output aaye).
  const langName =
    language === "odia" ? "Odia (ଓଡ଼ିଆ script)" : "Hindi (देवनागरी script)";

  try {
    // ---- Groq API call ----
    // Note: Groq OpenAI-compatible API deta hai, isliye ye familiar dikhega.
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        // YAHAN key use hoti hai. process.env se aati hai — code me kabhi
        // hardcode mat karna. Ye value server pe hai, browser me nahi.
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // llama-3.3-70b — Groq pe free, fast, aur Indian languages me theek.
        model: "llama-3.3-70b-versatile",
        temperature: 0.2, // kam temperature = consistent, seedha translation
        max_tokens: 250, // alert chhota hai, itna kaafi
        messages: [
          {
            // system prompt = model ko uska "role" batata hai.
            // Yahan hum bol rahe hain: kam-padhe-likhe gaonwale ke liye
            // simple bhasha, sirf translation do, koi bakwaas nahi.
            role: "system",
            content:
              "You translate cyclone safety alerts for villagers with basic literacy. " +
              "Output ONLY the translation. Use very simple everyday words, short sentences, " +
              "no English words, no explanations, no preamble.",
          },
          {
            role: "user",
            content: `Translate this cyclone alert into very simple ${langName}, maximum 3 short sentences:\n\n${text}`,
          },
        ],
      }),
    });

    // ---- Groq ne error diya? (key galat, rate limit, service down) ----
    if (!r.ok) {
      const detail = await r.text();
      console.error("Groq error:", detail); // Vercel logs me dikhega debugging ke liye
      return res.status(502).json({ error: "Translation service unavailable" });
    }

    const data = await r.json();
    // OpenAI-style response: choices[0].message.content me actual text hota hai.
    const out = data.choices?.[0]?.message?.content?.trim();

    // Kabhi-kabhi model khaali de deta hai — us case ko bhi handle karo.
    if (!out) return res.status(502).json({ error: "Empty translation" });

    // ---- Edge cache: same alert ka translation 10 min tak reuse ho ----
    // s-maxage=600 => Vercel ke edge pe 10 min cache. Wahi alert dubara
    // aaya to Groq ko call hi nahi hoga = fast + free.
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).json({ text: out });
  } catch (err) {
    // Network fail, JSON parse fail, ya koi unexpected crash — sab yahan.
    console.error("translate handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}