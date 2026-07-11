export default function Helplines({ controlRoom }) {
  const lines = [
    { who: "Cyclone Helpline", num: "1070", primary: true },
    { who: "Ambulance", num: "108", primary: true },
    { who: "Police", num: "100" },
    { who: "Fire", num: "101" },
  ];

  return (
    <div className="helplines-section">
      <div className="sec-title">
        <h2>Emergency helplines</h2>
      </div>

      <div className="lines">
        {lines.map((h) => {
          const cls = h.primary ? "line-btn primary" : "line-btn";
          return (
            <a key={h.num} className={cls} href={"tel:" + h.num}>
              <div className="who">{h.who}</div>
              <div className="num mono">{h.num}</div>
            </a>
          );
        })}

        {controlRoom && (
          <a className="line-btn control-room" href={"tel:" + controlRoom.replace(/-/g, "")}>
            <div className="who">District Control Room</div>
            <div className="num mono">{controlRoom}</div>
          </a>
        )}
      </div>
    </div>
  );
}
