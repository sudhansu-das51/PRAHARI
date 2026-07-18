const R = 6371; // km

/** Great-circle distance. Straight-line, not road distance — always shorter than the walk. */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Nearest `count` shelters to an origin, each tagged with its distance. */
export function nearest(shelters, originLat, originLon, count = 3) {
  return shelters
    .map((s) => ({ ...s, km: haversineKm(originLat, originLon, s.lat, s.lon) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}
