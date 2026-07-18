import { useEffect } from "react";

/**
 * Repaints the favicon to match the current alert level.
 *
 * The mark is rebuilt as a standalone SVG data URI with the colour baked in —
 * a favicon is rendered outside the document, so it cannot inherit
 * `currentColor` or read a CSS variable the way the in-page logo does.
 *
 * Geometry is kept in step with `PrahariMark` in components/Logo.jsx by hand;
 * if the arcs change there, change them here too. A dark rounded plate sits
 * behind the mark so it stays legible on a light browser tab.
 */
function markSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" rx="7" fill="#0A1015"/>
<path d="M11.80 3.80 A12.9 12.9 0 1 0 24.80 6.57" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" opacity="0.42"/>
<path d="M17.28 7.90 A8.2 8.2 0 1 0 23.31 12.28" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
<circle cx="16" cy="16" r="3.7" fill="${color}"/>
</svg>`;
}

export function useFavicon(color) {
  useEffect(() => {
    if (!color) return;

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = "data:image/svg+xml," + encodeURIComponent(markSvg(color));
  }, [color]);
}
