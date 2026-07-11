import { useState, useCallback } from "react";

export function useAdvisory() {
  const [status, setStatus] = useState("idle");
  const [advisory, setAdvisory] = useState(null);

  const fetchAdvisory = useCallback(async ({ district, level, gusts, rain }) => {
    setStatus("loading");
    try {
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

  const reset = useCallback(() => {
    setAdvisory(null);
    setStatus("idle");
  }, []);

  return { fetchAdvisory, advisory, status, reset };
}