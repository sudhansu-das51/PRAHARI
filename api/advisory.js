export default async function handler(req, res) {
  const { district, level, gusts, rain } = req.query || {};

  if (!district || !["green", "orange", "red"].includes(level)) {
    return res
      .status(400)
      .json({ error: "Need ?district=&level=green|orange|red" });
  }

  // First whitespace-delimited token, not just a trim. A key pasted into the
  // dashboard arrives with a trailing newline, or — as happened here — pasted
  // twice separated by one. A Groq key contains no whitespace, so anything
  // after the first token is paste damage. fetch throws on an invalid header
  // value rather than returning a bad response, so this never reaches Groq to
  // fail cleanly; it surfaces as an opaque 500 instead.
  const key = (process.env.GROQ_API_KEY || "").trim().split(/\s+/)[0] || "";
  if (!key) {
    console.error("GROQ_API_KEY is not set");
    return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server" });
  }

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "You write cyclone-preparedness advisories for coastal Odisha residents. " +
              "Output ONLY the numbered points, no preamble, no closing remarks.",
          },
          {
            role: "user",
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

    if (!r.ok) {
      const detail = await r.text();
      console.error("Groq error:", detail);
      return res.status(502).json({ error: "Advisory service unavailable" });
    }

    const data = await r.json();
    const choice = data.choices?.[0];
    const text = choice?.message?.content?.trim();

    // A cut-off advisory can drop the very instruction that matters, so a
    // truncated response is treated as a failure rather than shown.
    if (choice?.finish_reason === "length") {
      console.error("advisory truncated at max_tokens");
      return res.status(502).json({ error: "Advisory incomplete" });
    }

    if (!text) return res.status(502).json({ error: "Empty advisory" });

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({ advisory: text });
  } catch (err) {
    // Only the error's type goes out. Returning err.message leaked the key:
    // fetch puts the whole Authorization header into "…is an invalid header
    // value", so the response handed the credential to anyone who called the
    // endpoint. The message stays in the server log, where it is not public.
    console.error("advisory handler error:", err);
    return res.status(500).json({ error: "Internal error", type: String(err && err.name) });
  }
}
