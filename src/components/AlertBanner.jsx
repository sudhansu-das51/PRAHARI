import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LEVELS, DO_NOW } from "../lib/alertLevel";

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export default function AlertBanner({ districtName, level, headline, translatedAction, lang = "english" }) {
  const bannerRef = useRef(null);
  const pulseRef = useRef(null);
  const meta = LEVELS[level];

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const c = rgb(meta.color);

      gsap.to(document.documentElement, {
        "--alert": meta.color,
        "--alert-deep": meta.deep,
        duration: reduced ? 0 : 0.6,
        ease: "power2.out",
      });

      gsap.to(bannerRef.current, {
        borderColor: meta.color,
        boxShadow: `0 8px 28px rgba(0,0,0,0.4), 0 0 40px rgba(${c},0.16), inset 0 1px 0 rgba(255,255,255,0.22)`,
        duration: reduced ? 0 : 0.6,
        ease: "power2.out",
      });

      // No entrance tween here — App owns the whole intro on one timeline, and
      // a second tween on this element fought it for control of opacity.

      gsap.set(pulseRef.current, { opacity: 0, scale: 1 });
      if (level === "red" && !reduced) {
        gsap
          .timeline({ repeat: -1, repeatDelay: 0.4 })
          .fromTo(
            pulseRef.current,
            { opacity: 0.7, scale: 1 },
            { opacity: 0, scale: 1.03, duration: 1.4, ease: "power1.out" }
          );
      }
    },
    { dependencies: [level, districtName], scope: bannerRef }
  );

  return (
    <section className="banner" ref={bannerRef} role="status" aria-live="polite">
      <div className="pulse" ref={pulseRef}></div>
      <div className="lvl-label">Current alert level — {districtName}</div>
      <div className="lvl">{meta.word}</div>
      <div className="headline">{headline}</div>
      <div className="action">
        <strong>{DO_NOW[lang] || DO_NOW.english}</strong> {translatedAction || meta.action}
      </div>
    </section>
  );
}
