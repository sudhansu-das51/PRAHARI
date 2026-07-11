// src/hooks/useAdvisory.js
// -----------------------------------------------------------
// Claude se district ki detailed "aaj kya karein" advisory laane ka hook.
//
// Design decision: ye SIRF user ke tap pe chalta hai, automatically nahi.
// Kyun? Claude har call pe paisa leta hai. Auto-fetch karte to har district
// switch pe bill badhta. Isliye:
//   - button dabao tabhi call
//   - backend (/api/advisory) me 1-ghante ka cache
//   => Claude effectively ghante me ek baar hi chalta hai per district.
// -----------------------------------------------------------
import { useState, useCallback } from "react";

export function useAdvisory() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [advisory, setAdvisory] = useState(null);

  // User button dabaye to ye chalta hai. District ka current data pass hota hai
  // taaki Claude ko pata ho kis halat ke liye advisory likhni hai.
  const fetchAdvisory = useCallback(async ({ district, level, gusts, rain }) => {
    setStatus("loading");
    try {
      // GET request me numbers ko URL params bana ke bhejte hain.
      // Round isliye ki "142.7" jaisa lamba number URL me na jaye.
      const params = new URLSearchParams({
        district,
        level,
        gusts: String(Math.round(gusts || 0)),
        rain: String(Math.round(rain || 0)),
      });

      const res = await fetch(`/api/advisory?${params}`);
      if (!res.ok) throw new Error(`advisory api ${res.status}`);

      const data = await res.json();
      setAdvisory(data.advisory);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // District change hone pe purani advisory saaf karni padti hai, warna
  // Puri ki advisory Balasore pe dikhti rahegi. App.jsx isse call karega.
  const reset = useCallback(() => {
    setAdvisory(null);
    setStatus("idle");
  }, []);

  return { fetchAdvisory, advisory, status, reset };
}