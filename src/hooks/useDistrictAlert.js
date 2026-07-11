import { useEffect, useState } from "react";
import { computeLevel, buildHeadline } from "../lib/alertLevel";

const REFRESH_MS = 10 * 60 * 1000;

export function useDistrictAlert(district) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `alert-${district.id}`;

    async function load() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${district.lat}&longitude=${district.lon}` +
          `&hourly=wind_gusts_10m,precipitation,surface_pressure` +
          `&forecast_days=2&timezone=Asia%2FKolkata`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`weather api ${res.status}`);
        const data = await res.json();

        const gustsArr = data.hourly.wind_gusts_10m.slice(0, 24);
        const rainArr = data.hourly.precipitation.slice(0, 24);
        const pressArr = data.hourly.surface_pressure.slice(0, 24);

        const gusts = Math.max(...gustsArr);
        const rain = rainArr.reduce((a, b) => a + b, 0);
        const pressure = Math.min(...pressArr);
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
          try {
            localStorage.setItem(cacheKey, JSON.stringify(next));
          } catch {
          }
        }
      } catch (err) {
        if (cancelled) return;
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setState({ ...JSON.parse(cached), loading: false, stale: true });
            return;
          }
        } catch {
        }
        setState({ loading: false, error: true });
      }
    }

    setState({ loading: true });
    load();
    const t = setInterval(load, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [district.id, district.lat, district.lon, district.name]);

  return state;
}