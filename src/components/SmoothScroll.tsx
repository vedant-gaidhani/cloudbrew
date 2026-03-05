"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.05, // Lower for a heavier, smoother feel
                duration: 1.5,
                smoothWheel: true,
            }}
        >
            {children as any}
        </ReactLenis>
    );
}

