import { useState, useEffect } from "react";
import districts from "./data/districts.json";
import sheltersData from "./data/shelters.json";
import { LEVELS, getSeaCondition } from "./lib/alertLevel";
import { useDistrictAlert } from "./hooks/useDistrictAlert";
import { useTranslation } from "./hooks/useTranslation";
import { useAdvisory } from "./hooks/useAdvisory";
import AlertBanner from "./components/AlertBanner";
import StatsGrid from "./components/StatsGrid";
import ShelterList from "./components/ShelterList";
import { useClock } from "./hooks/useClock";
import Helplines from "./components/Helplines";

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
  const { translate, translated, status: langStatus } = useTranslation();
  const { fetchAdvisory, advisory, status: advStatus, reset: resetAdvisory } = useAdvisory();

  useEffect(() => {
    if (!alert.loading && !alert.error && lang !== "english") {
      const meta = LEVELS[alert.level];
      translate(`${alert.headline} ${meta.action}`, lang);
    }
  }, [lang, alert.level, alert.headline, alert.loading, alert.error, translate]);

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
    <div className="app">

      <header className="hdr">
        <h1>
          <span className="hdr-dot"></span>
          Odisha Cyclone Alert
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
              <AlertBanner
                districtName={district.name}
                level={alert.level}
                headline={alert.headline}
                translatedAction={lang !== "english" && translated ? translated : null}
              />


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

              {lang !== "english" && langStatus === "loading" && (<div className="lang-status">Translating\u2026</div>)}
              {lang !== "english" && langStatus === "error" && (<div className="lang-status">Translation unavailable, showing English. (Needs deployed /api)</div>)}
              {advStatus === "ready" && <div className="advisory-box">{advisory}</div>}
              {advStatus === "error" && (<div className="lang-status">Advisory unavailable. (Needs deployed /api)</div>)}

              <StatsGrid gusts={alert.gusts} rain={alert.rain} seaCondition={seaCondition} />
            </>
          )}
        </div>


        <div className="col">
          <ShelterList shelters={shelters} districtId={districtId} />
          <Helplines controlRoom={district.controlRoom} />
        </div>
      </div>


      <footer>
        <span className="data-source">Data: IMD Bhubaneswar · OSDMA</span>
        <span className="auto-refresh">Auto-refresh · 10 min</span>
      </footer>
    </div>
  );
}
