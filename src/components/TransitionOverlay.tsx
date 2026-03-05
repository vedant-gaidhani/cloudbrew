"use client";

import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function TransitionOverlay() {
    const isTransitioning = useStore((state) => state.isTransitioning);

    // Highly premium Awwwards-style cinematic easing curve
    const cinematicEase = [0.76, 0, 0.24, 1] as const;

    return (
        <motion.div
            className="fixed inset-0 z-[99999] bg-cb-cream pointer-events-none flex items-center justify-center overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: isTransitioning ? "0%" : "-100%" }}
            transition={{ duration: 0.8, ease: cinematicEase }}
            onAnimationComplete={() => {
                // If it just finished animating OUT (moving to -100%), 
                // silently instantly jump it back down to 100% so it's ready for the next click.
                if (!isTransitioning) {
                    // We don't need to do anything here technically because Framer Motion handles the state,
                    // but we need to reset the initial position if we want it to come from the bottom next time.
                    // To do this properly without a jank frame, we'll let the TransitionLink component handle the rapid reset,
                    // or rely on the `animate` prop logic.
                }
            }}
        >
            {/* Optional branding inside the overlay */}
            <motion.div
                className="font-serif text-5xl font-bold text-cb-espresso tracking-tighter"
                animate={{ opacity: isTransitioning ? 1 : 0, scale: isTransitioning ? 1 : 0.95 }}
                transition={{ duration: 0.4, delay: isTransitioning ? 0.3 : 0, ease: "easeOut" }}
            >
                CLOUDBREW
            </motion.div>
        </motion.div>
    );
}
