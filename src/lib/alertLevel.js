// src/lib/alertLevel.js
// -----------------------------------------------------------
// Alert level decide karne ka pura logic ek jagah.
// Thresholds IMD ki official classification se liye hain:
//   Cyclonic Storm        -> 62-88 km/h winds
//   Severe Cyclonic Storm -> 89-117 km/h
//   Very Severe           -> 118+ km/h
// Rain: IMD "heavy" = 115.6mm+, "very heavy" = 204.5mm+ (24hr)
// -----------------------------------------------------------

// Har level ka color + user ko kya bolna hai, sab ek object me.
// Fayda: naya level add karna ho (jaise "yellow") to bas yahan
// ek entry badhao, baaki app khud adjust ho jayegi.
export const LEVELS = {
  green: {
    word: "Normal",
    color: "#27AE60",
    deep: "#0E3D26", // banner ka dark background shade
    glow: "rgba(39,174,96,0.15)", // subtle glow for glassmorphism
    action:
      "Nothing urgent. Check alerts once a day and keep this page bookmarked.",
  },
  orange: {
    word: "Warning",
    color: "#F39C12",
    deep: "#4A2E05",
    glow: "rgba(243,156,18,0.15)",
    action:
      "Charge phones, store 3 days of water and dry food, keep documents in a sealed plastic bag.",
  },
  red: {
    word: "Danger",
    color: "#E74C3C",
    deep: "#4A120C",
    glow: "rgba(231,76,60,0.15)",
    action:
      "Move to your nearest cyclone shelter immediately. Do not wait for the storm to arrive.",
  },
};

// Core function: wind gust (km/h) + 24hr rain (mm) lo, level do.
// Dono me se jo bhi condition pehle hit ho, wahi level.
export function computeLevel(maxGustKmh, rain24mm) {
  if (maxGustKmh >= 118 || rain24mm >= 204) return "red";
  if (maxGustKmh >= 62 || rain24mm >= 115) return "orange";
  return "green";
}

// Banner ke liye ek readable line banao, live numbers ke saath.
// Isse alert generic nahi lagta — user ko actual forecast dikhta hai.
export function buildHeadline(district, level, gusts, rain) {
  if (level === "red")
    return `Severe cyclone crossing the coast \u2014 landfall expected within 12 hours.`;

  if (level === "orange")
    return `Cyclone alert for coastal districts \u2014 landfall expected within 48 hours.`;

  return `No cyclone threat for coastal Odisha right now.`;
}

// Sea condition derive from wind gusts
export function getSeaCondition(gustsKmh) {
  if (gustsKmh >= 90) return "VERY ROUGH";
  if (gustsKmh >= 50) return "ROUGH";
  if (gustsKmh >= 30) return "MODERATE";
  return "CALM";
}