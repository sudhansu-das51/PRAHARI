import { Component } from "react";

/**
 * Stops one broken component from taking the whole page down.
 *
 * On a normal site a blank page is an annoyance. Here it removes the shelter
 * list and the helpline numbers from someone who may be about to need them, so
 * every boundary falls back to something still useful rather than to nothing.
 *
 * Must be a class — React has no hook equivalent of componentDidCatch.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Kept in the console rather than swallowed — without a report the failure
    // is invisible, and this page is not one to let fail quietly.
    console.error("Prahari crashed in", this.props.name || "app", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return this.props.fallback;
  }
}

/** Last resort, used when the crash is bad enough to lose the whole page. */
export function EmergencyFallback() {
  const lines = [
    { who: "Cyclone helpline", num: "1070" },
    { who: "Ambulance", num: "108" },
    { who: "Police", num: "100" },
    { who: "Fire", num: "101" },
  ];

  // Deliberately plain: no GSAP, no data files, no hooks, no computed layout.
  // A fallback that depends on the things that just broke is not a fallback.
  return (
    <div className="crash">
      <div className="crash-card">
        <h1 className="crash-title">Prahari hit an error</h1>
        <p className="crash-body">
          The alert page could not load. These emergency numbers still work — they
          are dialled directly and need no internet.
        </p>

        <div className="crash-lines">
          {lines.map((l) => (
            <a key={l.num} className="crash-line" href={`tel:${l.num}`}>
              <span className="crash-who">{l.who}</span>
              <span className="crash-num">{l.num}</span>
            </a>
          ))}
        </div>

        <button className="crash-retry" onClick={() => window.location.reload()}>
          Reload the page
        </button>

        <p className="crash-note">
          For your district control room number, call 1077 — the state toll-free
          line routes to it.
        </p>
      </div>
    </div>
  );
}

/** Used inside the page, so a failed section does not remove its neighbours. */
export function SectionFallback({ label }) {
  return (
    <div className="section-fallback" role="alert">
      {label} could not be shown. The rest of this page still works — if you need
      a shelter, call the district control room below.
    </div>
  );
}
