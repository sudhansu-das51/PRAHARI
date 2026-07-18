/**
 * PRAHARI — combination mark.
 *
 * The mark is the eye of a storm seen from above: a solid core with two broken
 * bands around it. Each band's gap sits a little further round than the one
 * inside it, so the breaks read as a spiral sweep instead of a stack of
 * identical rings. Drawn on a 32x32 grid with heavy strokes because the same
 * geometry has to survive as a 16px favicon.
 *
 * No SVG filter is used. The glow is a wide, low-opacity disc behind the core —
 * a feGaussianBlur would have to re-render on every frame of the band rotation,
 * and a plain fill costs nothing. Only the bands rotate for the same reason.
 *
 * Everything is `currentColor`, so the mark inherits whatever the alert level
 * has set — one definition serves the header, the favicon, and every level.
 */

export function PrahariMark({ size = 28, className = "", spin = true }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className={spin ? "mark-bands" : undefined}>
        {/* outer band — thinner and dimmer, the far edge of the sweep */}
        <path
          d="M11.80 3.80 A12.9 12.9 0 1 0 24.80 6.57"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          opacity="0.42"
        />
        {/* inner band */}
        <path
          d="M17.28 7.90 A8.2 8.2 0 1 0 23.31 12.28"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.78"
        />
      </g>

      {/* glow, then the eye — both static so the rotation stays cheap */}
      <circle cx="16" cy="16" r="7" fill="currentColor" opacity="0.14" />
      <circle cx="16" cy="16" r="3.7" fill="currentColor" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="logo">
      <PrahariMark size={26} className="logo-mark" />
      <span className="logo-word">Prahari</span>
      <span className="logo-sub">Odisha Cyclone Alert</span>
    </span>
  );
}
