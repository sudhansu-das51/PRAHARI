// src/hooks/useTranslation.js
// -----------------------------------------------------------
// Alert text ko Odia/Hindi me translate karwane ka hook.
// Ye khud Groq ko call NAHI karta — wo backend ka kaam hai.
// Ye sirf /api/translate (hamara serverless function) ko call karta hai.
// Key browser me kabhi nahi aati.
//
// Do cheezein isme important:
//  1. cache: same (text + language) dubara translate mat karo
//  2. status: UI ko pata chale loading/error/ready
// -----------------------------------------------------------
import { useState, useCallback, useRef } from "react";

export function useTranslation() {
  // status ka flow: idle -> loading -> ready (ya error)
  const [status, setStatus] = useState("idle");
  const [translated, setTranslated] = useState(null);

  // cache ko useRef me rakha, useState me nahi — kyunki cache change
  // hone pe re-render nahi chahiye, ye sirf ek memory store hai.
  const cache = useRef({});

  const translate = useCallback(async (text, language) => {
    // English maang raha hai to kuch translate karne ki zaroorat hi nahi
    if (language === "english") {
      setTranslated(null);
      setStatus("idle");
      return;
    }

    // cache key = language + text. Agar pehle se hai to instant return.
    const key = `${language}::${text}`;
    if (cache.current[key]) {
      setTranslated(cache.current[key]);
      setStatus("ready");
      return; // Groq ko call hi nahi kiya — token + time dono bache
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
      cache.current[key] = data.text; // agli baar ke liye yaad rakho
      setTranslated(data.text);
      setStatus("ready");
    } catch {
      // fail hua to error flag — App.jsx isse dekh ke English dikhata rahega
      setStatus("error");
    }
  }, []);

  return { translate, translated, status };
}