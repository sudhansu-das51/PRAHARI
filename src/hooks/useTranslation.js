import { useState, useCallback, useRef } from "react";

export function useTranslation() {
  const [status, setStatus] = useState("idle");
  const [translated, setTranslated] = useState(null);

  const cache = useRef({});

  const translate = useCallback(async (text, language) => {
    if (language === "english") {
      setTranslated(null);
      setStatus("idle");
      return;
    }

    const key = `${language}::${text}`;
    if (cache.current[key]) {
      setTranslated(cache.current[key]);
      setStatus("ready");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) throw new Error(`translate api ${res.status}`);

      const data = await res.json();
      cache.current[key] = data.text;
      setTranslated(data.text);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  return { translate, translated, status };
}