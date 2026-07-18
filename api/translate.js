export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, language } = req.body || {};

  if (!text || !["odia", "hindi"].includes(language)) {
    return res
      .status(400)
      .json({ error: "Need { text, language: odia|hindi }" });
  }
  if (text.length > 800) {
    return res.status(400).json({ error: "Text too long" });
  }

  const langName =
    language === "odia" ? "Odia (ଓଡ଼ିଆ script)" : "Hindi (देवनागरी script)";

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        // Odia costs ~5x the tokens of Hindi for the same sentence (317 vs 64
        // measured) because the tokenizer barely covers the script. At 250 the
        // Odia alert truncated mid-word, dropping the "do not" off the last
        // instruction — so the budget is sized for the worst case, not Hindi.
        max_tokens: 700,
        messages: [
          {
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

    if (!r.ok) {
      const detail = await r.text();
      console.error("Groq error:", detail);
      return res.status(502).json({ error: "Translation service unavailable" });
    }

    const data = await r.json();
    const choice = data.choices?.[0];
    const out = choice?.message?.content?.trim();

    // A half-finished safety instruction is worse than none — "wait for the
    // storm" reads as the opposite of "do not wait for the storm". Fail here
    // and let the UI keep showing the English original.
    if (choice?.finish_reason === "length") {
      console.error("translation truncated at max_tokens", { language });
      return res.status(502).json({ error: "Translation incomplete" });
    }

    if (!out) return res.status(502).json({ error: "Empty translation" });

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    return res.status(200).json({ text: out });
  } catch (err) {
    console.error("translate handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}