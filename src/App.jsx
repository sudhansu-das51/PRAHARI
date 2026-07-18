import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import districts from "./data/districts.json";
import sheltersData from "./data/shelters.json";
import { LEVELS, LOCALIZED, getSeaCondition } from "./lib/alertLevel";
import { useDistrictAlert } from "./hooks/useDistrictAlert";
import { useAdvisory } from "./hooks/useAdvisory";
import { useFavicon } from "./hooks/useFavicon";
import Logo from "./components/Logo";
import AlertBanner from "./components/AlertBanner";
import StatsGrid from "./components/StatsGrid";
import ShelterList from "./components/ShelterList";
import { useClock } from "./hooks/useClock";
import Helplines from "./components/Helplines";
import ErrorBoundary, { SectionFallback } from "./components/ErrorBoundary";

gsap.registerPlugin(useGSAP);

const LANGS = [
  { id: "english", label: "English" },
  { id: "odia", label: "\u0b13\u0b21\u0b3c\u0b3f\u0b06" },
  { id: "hindi", label: "\u0939\u093f\u0902\u0926\u0940" },
];

export default function App() {
  const [districtId, setDistrictId] = useState("puri");
  const [lang, setLang] = useState("english");

  const district = districts.find((d) => d.id === districtId);
  const shelters = sheltersData[districtId] || [];
  const alert = useDistrictAlert(district);
  const { fetchAdvisory, advisory, status: advStatus, reset: resetAdvisory } = useAdvisory();

  // Tab icon tracks the alert level, so a red warning is visible from a
  // background tab without the page being open.
  useFavicon((LEVELS[alert.level] || LEVELS.green).color);

  const appRef = useRef(null);
  const introDone = useRef(false);
  const ready = !alert.loading && !alert.error;

  /**
   * One timeline owns the whole entrance.
   *
   * Previously each component animated itself on mount while the header,
   * controls, stats and helplines just appeared — several unsynchronised
   * starts read as stutter rather than one movement. Everything now sits on a
   * single timeline placed with position parameters, so the page arrives as
   * one gesture.
   *
   * It waits for `ready` because the banner replaces a skeleton of a different
   * height; animating before the swap means animating into a layout jump.
   */
  useGSAP(
    () => {
      if (!ready || introDone.current) return;
      introDone.current = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // The intro hides everything and fades it back in, so it must only run
      // when there is a ticker to finish it. A page opened into a background
      // tab gets its rAF throttled to nothing — the timeline would never
      // advance and the alert would sit at opacity 0 until the tab was
      // focused. Skipping the intro leaves the content plainly visible, which
      // is the only acceptable failure mode here.
      if (document.visibilityState !== "visible") return;

      const cards = gsap.utils.toArray(
        ".field, .banner, .bottom-controls > *, .stat, .sec-title, .shelter, .origin-note, .line-btn"
      );

      const root = appRef.current;

      const tl = gsap.timeline({
        defaults: { duration: 0.5, ease: "power3.out", force3D: true },
        onStart: () => {
          // Suspends backdrop-filter on the glass cards for the duration —
          // see the .intro-running rule in index.css.
          root.classList.add("intro-running");
          // will-change is granted for the tween only. Left on permanently it
          // pins a compositor layer per card, all 16 of them blurred.
          gsap.set(cards, { willChange: "transform, opacity" });
        },
        onComplete: () => {
          root.classList.remove("intro-running");
          gsap.set(cards, { clearProps: "willChange,transform" });
        },
      });

      tl.from(".logo", { y: -8, opacity: 0, duration: 0.4 }, 0)
        .from(".updated", { opacity: 0, duration: 0.4 }, 0.06)
        .addLabel("body", 0.1)
        // the two columns come in together so neither side looks late
        .from(".field", { y: 10, opacity: 0 }, "body")
        .from(".sec-title", { opacity: 0, stagger: 0.08 }, "body")
        .from(".banner", { y: 14, opacity: 0, duration: 0.6 }, "body+=0.06")
        .from(".shelter", { y: 12, opacity: 0, stagger: 0.07 }, "body+=0.12")
        .from(".bottom-controls > *", { y: 10, opacity: 0, stagger: 0.06 }, "body+=0.24")
        .from(".line-btn", { y: 10, opacity: 0, stagger: 0.05 }, "body+=0.3")
        .from(".stat", { y: 10, opacity: 0, stagger: 0.06 }, "body+=0.36")
        .from(".origin-note", { opacity: 0, duration: 0.4 }, "body+=0.42")
        .from("footer", { opacity: 0, duration: 0.4 }, "body+=0.46");

      // Second belt: if the tab is backgrounded part-way through, GSAP parks
      // the playhead and the rest of the page stays hidden until the user
      // comes back. Well after the intro should have ended, jump it to the
      // finish regardless. Content visible beats content animated.
      const failsafe = setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, 2500);

      return () => {
        clearTimeout(failsafe);
        // Never leave the page frosted-off because the intro was interrupted.
        root.classList.remove("intro-running");
      };
    },
    { dependencies: [ready], scope: appRef }
  );

  // Headline and action are swapped as a pair — showing an Odia headline above
  // an English instruction (or the reverse) is worse than staying in one language.
  const localized = lang === "english" ? null : LOCALIZED[alert.level]?.[lang];

  useEffect(() => {
    resetAdvisory();
  }, [districtId, resetAdvisory]);

  const now = useClock();
  const liveTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const updatedTime = alert.updated
    ? new Date(alert.updated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
    : "\u2014";

  const seaCondition = alert.gusts ? getSeaCondition(alert.gusts) : "—";

  return (
    <div className="app" ref={appRef}>

      <header className="hdr">
        <h1>
          <Logo />
        </h1>
        <div className="updated">
          {liveTime} IST
          {alert.stale && <span className="stale">OFFLINE · LAST KNOWN DATA</span>}
        </div>
      </header>


      <div className="grid">

        <div className="col">

          <div className="field">
            <select id="district" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
              {districts.map((d) => (<option key={d.id} value={d.id}>{d.name} District</option>))}
            </select>
          </div>

          {alert.loading && <div className="skeleton" aria-label="Loading live weather" />}
          {alert.error && (
            <div className="error-box">
              Live weather could not be loaded and no cached data exists yet for this district. Check your connection and retry — shelters and helplines still work.
            </div>
          )}
          {!alert.loading && !alert.error && (
            <>
              {/* The banner runs GSAP against a level that changes underneath
                  it — the most animated thing on the page, so the most likely
                  to throw. A failure here must not take the stats or the
                  district picker with it. */}
              <ErrorBoundary
                name="alert banner"
                fallback={<SectionFallback label="The alert level" />}
              >
                <AlertBanner
                  districtName={district.name}
                  level={alert.level}
                  headline={localized ? localized.headline : alert.headline}
                  translatedAction={localized ? localized.action : null}
                  lang={lang}
                />
              </ErrorBoundary>


              <div className="bottom-controls">
                <div className="langs" role="group" aria-label="Alert language">
                  {LANGS.map((l) => (
                    <button key={l.id} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
                  ))}
                </div>
                <button
                  className="advisory-btn"
                  onClick={() => fetchAdvisory({ district: district.name, level: alert.level, gusts: alert.gusts, rain: alert.rain })}
                  disabled={advStatus === "loading"}
                >
                  {advStatus === "loading" ? "Preparing advisory\u2026" : "View full advisory \u2192"}
                </button>
              </div>

              {advStatus === "ready" && <div className="advisory-box">{advisory}</div>}
              {advStatus === "error" && (<div className="lang-status">Advisory unavailable. (Needs deployed /api)</div>)}

              <StatsGrid gusts={alert.gusts} rain={alert.rain} seaCondition={seaCondition} />
            </>
          )}
        </div>


        <div className="col">
          {/* Geolocation, haversine maths and a re-sorting list — and it sits
              directly above the helplines. Boundaried separately so a crash
              here still leaves the phone numbers on screen, which are the one
              thing on this page that always works. */}
          <ErrorBoundary
            name="shelters"
            fallback={<SectionFallback label="The shelter list" />}
          >
            <ShelterList shelters={shelters} districtId={districtId} district={district} />
          </ErrorBoundary>

          <Helplines controlRoom={district.controlRoom} />
        </div>
      </div>


      <footer>
        {/* Attribution names the actual sources. This used to credit IMD
            Bhubaneswar, which supplies none of this data — the forecast comes
            from Open-Meteo. Claiming a government met agency on an emergency
            page lends it authority it has not earned. */}
        <span className="data-source">
          Weather: Open-Meteo · Shelters &amp; control rooms: OSDMA
        </span>
        <span className="auto-refresh">Auto-refresh · 10 min</span>
      </footer>
    </div>
  );
}
