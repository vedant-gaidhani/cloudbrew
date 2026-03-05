"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!cursorRef.current) return;

        // Set initial offsets perfectly centered
        gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50 });

        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3" });

        const moveCursor = (e: MouseEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener("mousemove", moveCursor);

        // Dynamic hover listeners for links, buttons, and menu items
        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInteractive = target.closest('a, button, [role="button"], .menu-item');

            if (isInteractive) {
                gsap.to(cursorRef.current, { scale: 3, backgroundColor: "#4A3728", duration: 0.3, ease: "power2.out" });
            } else {
                gsap.to(cursorRef.current, { scale: 1, backgroundColor: "transparent", duration: 0.3, ease: "power2.out" });
            }
        };

        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-4 h-4 rounded-full border border-cb-espresso pointer-events-none z-[9999] mix-blend-difference"
        />
    );
}
