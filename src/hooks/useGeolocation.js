import { useState, useEffect } from "react";

/**
 * The user's position, used to rank shelters by real distance.
 *
 * Resolves to a status rather than throwing, because "we don't know where you
 * are" has to be shown to the user — a distance measured from the district
 * headquarters is not the same promise as a distance measured from them, and
 * the UI has to be able to say which one it is.
 */
export function useGeolocation() {
  const [state, setState] = useState({ status: "prompting" });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState({ status: "unsupported" });
      return;
    }

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setState({
          status: "ready",
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (cancelled) return;
        setState({ status: err.code === err.PERMISSION_DENIED ? "denied" : "unavailable" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
