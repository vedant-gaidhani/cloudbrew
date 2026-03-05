"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function Loader({ onComplete }: { onComplete: () => void }) {
    const [progress, setProgress] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Animate progress 0 to 100
        const obj = { value: 0 };
        const tl = gsap.timeline({
            onComplete: () => {
                // Fade out loader
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        gsap.set(containerRef.current, { display: "none" });
                        onComplete();
                    },
                });
            },
        });

        tl.to(obj, {
            value: 100,
            duration: 2.5,
            ease: "power4.inOut",
            onUpdate: () => {
                setProgress(Math.round(obj.value));
            },
        });
    }, [onComplete]);

    return (
        <div ref={containerRef} className="loader-container fixed inset-0 z-50 flex flex-col items-center justify-center bg-cb-cream text-cb-espresso">
            <div className="font-serif text-8xl md:text-[12vw] font-bold tracking-tighter leading-none mix-blend-multiply">
                {progress.toString().padStart(2, "0")}
            </div>
            <div className="absolute bottom-10 font-sans text-sm tracking-widest font-medium uppercase">
                Brewing the Experience
            </div>
        </div>
    );
}
