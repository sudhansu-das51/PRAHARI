import { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { nearest } from "../lib/distance";
import { useGeolocation } from "../hooks/useGeolocation";

export default function ShelterList({ shelters, districtId, district }) {
    const listRef = useRef(null);
    const geo = useGeolocation();

    // Fall back to the district headquarters so the list is never empty, but
    // track which origin was used — "nearest to you" and "nearest to the
    // district HQ" are different claims and the user is told which one this is.
    const usingMyLocation = geo.status === "ready";
    const originLat = usingMyLocation ? geo.lat : district.lat;
    const originLon = usingMyLocation ? geo.lon : district.lon;

    // OSDMA's registry returns 100+ shelters for every coastal district except
    // Jagatsinghpur, which returns 5 — its nearest then reads as ~26km, which
    // in a cyclone means "none". The gap is upstream, but a user cannot tell an
    // incomplete list from a genuinely empty district, so it has to be said out
    // loud rather than quietly showing a distance nobody can walk.
    const registryIncomplete = shelters.length > 0 && shelters.length < 20;

    // The warning takes the height of one card, so it replaces one rather than
    // pushing the column past the viewport. Where the list is known to be
    // missing entries, "call the control room" is worth more than a third
    // shelter that is even further away than the two above it.
    const shown = useMemo(
        () => nearest(shelters, originLat, originLon, registryIncomplete ? 2 : 3),
        [shelters, originLat, originLon, registryIncomplete]
    );

    // The first paint is animated by App's intro timeline. This only covers
    // later changes — switching district, or geolocation arriving and
    // reordering the list — so the two never animate the same cards at once.
    //
    // Detected by comparing against the last rendered values rather than a
    // "first run" flag: StrictMode invokes effects twice on mount, which
    // consumes a one-shot flag before any real change has happened. A value
    // comparison is idempotent, so the double invoke is harmless.
    const prev = useRef(null);

    useGSAP(
        () => {
            const signature = `${districtId}|${usingMyLocation}`;
            const changed = prev.current !== null && prev.current !== signature;
            prev.current = signature;
            if (!changed) return;

            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduced || !listRef.current || document.visibilityState !== "visible") return;
            gsap.fromTo(
                listRef.current.children,
                { y: 12, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    ease: "power3.out",
                    force3D: true,
                    clearProps: "willChange",
                }
            );
        },
        { dependencies: [districtId, usingMyLocation], scope: listRef }
    );

    const originNote = {
        ready: "straight-line from your location",
        prompting: "locating you… showing from district HQ",
        denied: "location off — showing from district HQ",
        unavailable: "location unavailable — showing from district HQ",
        unsupported: "showing from district HQ",
    }[geo.status];

    return (
        <div className="shelters-section">
            <div className="sec-title">
                <h2>Nearest shelters</h2>
                <span className="count">{shelters.length} in district</span>
            </div>
            <div className="shelter-list" ref={listRef}>
                {shown.map((s) => (
                    /* Opens directions. Maps snaps the destination to the nearest
                       routable road since it cannot route inside a building, so the
                       pin lands near the shelter rather than on it — but tested
                       against the alternative, this is the more useful behaviour:
                       the `search/?api=1&query=` form marks the exact point yet
                       showed no usable location at all on the ground.

                       Routed by coordinate, never by name: the registry's labels are
                       village names a search would not resolve reliably, and sending
                       someone to the wrong village during a cyclone is unthinkable. */
                    <a
                        className="shelter"
                        key={`${s.name}-${s.lat}-${s.lon}`}
                        href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Directions to ${s.name} cyclone shelter in ${s.block} block, ${
                            s.km < 10 ? s.km.toFixed(1) : Math.round(s.km)
                        } kilometres away`}
                    >
                        <div className="shelter-text">
                            <div className="nm">{s.name}</div>
                            <div className="meta">
                                {s.block} block{s.type ? ` · ${s.type}` : ""}
                            </div>
                        </div>
                        <div className="dist mono">
                            {s.km < 10 ? s.km.toFixed(1) : Math.round(s.km)}
                            <small>km</small>
                        </div>
                        <svg
                            className="shelter-go"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M5 12h13M13 6l6 6-6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </a>
                ))}
            </div>
            {registryIncomplete ? (
                <div className="registry-warning" role="status">
                    <strong>This list is incomplete.</strong> OSDMA publishes only{" "}
                    {shelters.length} shelters for this district, so there are almost
                    certainly closer ones not shown. Call the district control room
                    below for the shelter nearest you.
                </div>
            ) : null}

            <div className="origin-note">{originNote}</div>
        </div>
    );
}
