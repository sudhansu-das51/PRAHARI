// src/components/StatsGrid.jsx
// -----------------------------------------------------------
// Three weather stat cards matching the glassmorphism mockup:
// WIND GUST | RAINFALL · 24H | SEA CONDITION
// -----------------------------------------------------------

export default function StatsGrid({ gusts, rain, seaCondition }) {
  return (
    <div className="stats">
      {/* Card 1: sabse tez jhonka */}
      <div className="stat glass">
        <div className="k">Wind gust</div>
        <div className="v">
          {Math.round(gusts)} <span className="u">km/h</span>
        </div>
      </div>

      {/* Card 2: total barish */}
      <div className="stat glass">
        <div className="k">Rainfall · 24H</div>
        <div className="v">
          {rain} <span className="u">mm</span>
        </div>
      </div>

      {/* Card 3: sea condition derived from wind */}
      <div className="stat glass">
        <div className="k">Sea condition</div>
        <div className="v" style={{ fontSize: rain > 999 ? 18 : undefined }}>
          {seaCondition}
        </div>
      </div>
    </div>
  );
}