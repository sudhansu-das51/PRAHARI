// api/advisory.js
// -----------------------------------------------------------
// Vercel SERVERLESS FUNCTION — server pe chalti hai, browser me nahi.
// Yahan Claude ki API key use hoti hai (safely, process.env se).
//
// Kaam: district ki detailed "aaj kya karein" advisory — 5 concrete
// action points. Frontend (useAdvisory hook) button dabane pe call karta hai.
//
// SABSE IMPORTANT LINE poore file me: Cache-Control s-maxage=3600.
// Ye Claude ko ghante me ~ek baar hi chalne deta hai per district.
// Iske bina, har button click = naya Claude call = badhta bill.
// Iske saath, pehla click Claude ko call karta hai, agle 1 ghante ke
// saare clicks cached jawab paate hain = fast + almost free.
//
// ANTHROPIC_API_KEY Vercel Environment Variables me set hona chahiye.
// -----------------------------------------------------------

export default async function handler(req, res) {
  // Frontend ne GET request me query params bheje: ?district=&level=&gusts=&rain=
  const { district, level, gusts, rain } = req.query || {};

  // ---- Validation: district aur valid level hona chahiye ----
  if (!district || !["green", "orange", "red"].includes(level)) {
    return res
      .status(400)
      .json({ error: "Need ?district=&level=green|orange|red" });
  }

  try {
    // ---- Claude API call ----
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        // Claude "x-api-key" header use karta hai (Groq wala "Bearer" nahi).
        // Key process.env se — code me kabhi hardcode nahi.
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        // Anthropic ko version header chahiye hota hai.
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400, // 5 chhote points, itna kaafi
        messages: [
          {
            role: "user",
            // Prompt me current halat (level + gusts + rain) daal rahe hain
            // taaki advisory generic na ho — actual forecast ke hisaab se ho.
            // "exactly 5", "max 15 words", "ONLY the points" — sakht rules
            // taaki output predictable aur UI me clean dikhe.
            content:
              `You are writing a cyclone-preparedness advisory for ${district} district, coastal Odisha, India. ` +
              `Current alert level: ${level.toUpperCase()}. ` +
              `Forecast next 24h: wind gusts up to ${gusts || "?"} km/h, total rain ${rain || "?"} mm.\n\n` +
              `Write exactly 5 short, concrete action points for residents, ordered by priority. ` +
              `Plain language, no jargon. Each point max 15 words. ` +
              `Output ONLY the 5 numbered points, nothing else.`,
          },
        ],
      }),
    });

    // ---- Claude ne error diya? (key galat, rate limit, service down) ----
    if (!r.ok) {
      const detail = await r.text();
      console.error("Claude error:", detail); // Vercel logs me debugging ke liye
      return res.status(502).json({ error: "Advisory service unavailable" });
    }

    const data = await r.json();
    // Claude ka response content[] array hota hai, jisme text blocks hote hain.
    // Sirf text-type blocks nikaal ke jod do (safe parsing, position pe bharosa nahi).
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) return res.status(502).json({ error: "Empty advisory" });

    // ---- YEHI LINE bill bachati hai ----
    // s-maxage=3600 => Vercel edge pe 1 GHANTA cache. Same district+level ka
    // advisory dubara maanga jaye to Claude ko call kiye bina cached milta hai.
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({ advisory: text });
  } catch (err) {
    // Network fail, parse fail, ya koi unexpected crash — sab yahan.
    console.error("advisory handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}