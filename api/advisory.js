export default async function handler(req, res) {
  const { district, level, gusts, rain } = req.query || {};

  if (!district || !["green", "orange", "red"].includes(level)) {
    return res
      .status(400)
      .json({ error: "Need ?district=&level=green|orange|red" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        messages: [
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
      console.error("Claude error:", detail);
      return res.status(502).json({ error: "Advisory service unavailable" });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) return res.status(502).json({ error: "Empty advisory" });

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
    return res.status(200).json({ advisory: text });
  } catch (err) {
    console.error("advisory handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}