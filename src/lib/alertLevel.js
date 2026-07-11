export const LEVELS = {
  green: {
    word: "Normal",
    color: "#27AE60",
    deep: "#0E3D26",
    glow: "rgba(39,174,96,0.15)",
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

export function computeLevel(maxGustKmh, rain24mm) {
  if (maxGustKmh >= 118 || rain24mm >= 204) return "red";
  if (maxGustKmh >= 62 || rain24mm >= 115) return "orange";
  return "green";
}

export function buildHeadline(district, level, gusts, rain) {
  if (level === "red")
    return `Severe cyclone crossing the coast \u2014 landfall expected within 12 hours.`;

  if (level === "orange")
    return `Cyclone alert for coastal districts \u2014 landfall expected within 48 hours.`;

  return `No cyclone threat for coastal Odisha right now.`;
}

export function getSeaCondition(gustsKmh) {
  if (gustsKmh >= 90) return "VERY ROUGH";
  if (gustsKmh >= 50) return "ROUGH";
  if (gustsKmh >= 30) return "MODERATE";
  return "CALM";
}