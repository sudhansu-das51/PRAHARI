// src/hooks/useDistrictAlert.js
// -----------------------------------------------------------
// Ek district ka live weather lao aur alert-ready state banao.
// Source: Open-Meteo (free, no API key, CORS enabled) — isliye
// browser se DIRECT call kar sakte hain, serverless ki zaroorat nahi.
//
// Offline plan: har successful fetch localStorage me save hota hai.
// Network gaya -> wahi cached data dikhao, "stale" flag ke saath.
// -----------------------------------------------------------
import { useEffect, useState } from "react";
import { computeLevel, buildHeadline } from "../lib/alertLevel";

const REFRESH_MS = 10 * 60 * 1000; // 10 minute — weather isse fast nahi badalta

export function useDistrictAlert(district) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    // cancelled flag: agar user ne district switch kar diya beech me,
    // to purani fetch ka result state me nahi ghusna chahiye
    let cancelled = false;
    const cacheKey = `alert-${district.id}`;

    async function load() {
      try {
        // hourly params: wind gusts, rain, pressure — 2 din ka forecast
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${district.lat}&longitude=${district.lon}` +
          `&hourly=wind_gusts_10m,precipitation,surface_pressure` +
          `&forecast_days=2&timezone=Asia%2FKolkata`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`weather api ${res.status}`);
        const data = await res.json();

        // Sirf agle 24 ghante ki window uthao
        const gustsArr = data.hourly.wind_gusts_10m.slice(0, 24);
        const rainArr = data.hourly.precipitation.slice(0, 24);
        const pressArr = data.hourly.surface_pressure.slice(0, 24);

        const gusts = Math.max(...gustsArr);              // worst gust
        const rain = rainArr.reduce((a, b) => a + b, 0);  // total rain
        const pressure = Math.min(...pressArr);           // lowest pressure
        const level = computeLevel(gusts, rain);

        const next = {
          loading: false,
          stale: false,
          gusts,
          rain: Math.round(rain),
          pressure: Math.round(pressure),
          level,
          headline: buildHeadline(district.name, level, gusts, rain),
          updated: new Date().toISOString(),
        };

        if (!cancelled) {
          setState(next);
          // offline fallback ke liye save — try/catch isliye ki
          // private mode me localStorage throw kar sakta hai
          try {
            localStorage.setItem(cacheKey, JSON.stringify(next));
          } catch {
            /* storage unavailable — koi baat nahi, app phir bhi chalega */
          }
        }
      } catch (err) {
        // Network/API fail -> last known data dikhao, clearly marked stale
        if (cancelled) return;
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setState({ ...JSON.parse(cached), loading: false, stale: true });
            return;
          }
        } catch {
          /* ignore */
        }
        // na network, na cache — honest error state
        setState({ loading: false, error: true });
      }
    }

    setState({ loading: true }); // district switch pe fresh skeleton
    load();
    const t = setInterval(load, REFRESH_MS);

    // cleanup: interval band + purani fetch ka result ignore
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [district.id, district.lat, district.lon, district.name]);

  return state;
}