import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ShelterList({ shelters, districtId }) {
    const listRef = useRef(null);
    const shown = shelters.slice(0, 3);

    useGSAP(
        () => {
            const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduced || !listRef.current) return;
            gsap.fromTo(
                listRef.current.children,
                { y: 14, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.07, ease: "power2.out" }
            );
        },
        { dependencies: [districtId], scope: listRef }
    );

    return (
        <div>
            <div className="sec-title">
                <h2>Nearest shelters</h2>
            </div>
            <div className="shelter-list" ref={listRef}>
                {shown.map((s) => (
                    <div className="shelter" key={s.name}>
                        <div>
                            <div className="nm">{s.name}</div>
                            <div className="meta">{s.block} · Capacity {s.capacity.toLocaleString("en-IN")}</div>
                        </div>
                        <div className="dist mono">
                            {s.km}<small>km</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
