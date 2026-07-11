
export default function StatsGrid({ gusts, rain, seaCondition }) {
  return (
    <div className="stats">
      <div className="stat glass">
        <div className="k">Wind gust</div>
        <div className="v">
          {Math.round(gusts)} <span className="u">km/h</span>
        </div>
      </div>

      <div className="stat glass">
        <div className="k">Rainfall · 24H</div>
        <div className="v">
          {rain} <span className="u">mm</span>
        </div>
      </div>

      <div className="stat glass">
        <div className="k">Sea condition</div>
        <div className="v" style={{ fontSize: rain > 999 ? 18 : undefined }}>
          {seaCondition}
        </div>
      </div>
    </div>
  );
}