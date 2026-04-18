"use client";

import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import { ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
    const [clickCount, setClickCount] = useState(0);
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSecretClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount === 3) {
            setClickCount(0);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            router.push('/midnight');
            return;
        }

        // Reset counter if they don't click 3 times within 5 seconds
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setClickCount(0);
        }, 5000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <footer className="w-full bg-cb-espresso text-cb-cream flex flex-col items-center justify-between pt-32 pb-8 px-6 relative z-10 overflow-hidden">
            {/* Top Massive Typography */}
            <div className="w-full flex justify-center mb-24">
                <h2 className="font-serif text-[15vw] leading-none font-bold tracking-tighter text-cb-cream/90 selection:bg-cb-cream selection:text-cb-espresso">
                    CLOUDBREW
                </h2>
            </div>

            {/* Middle Grid: 3 Columns */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-24">
                {/* Column 1: Explore */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-sans text-xs tracking-[0.2em] font-bold opacity-50 uppercase mb-4">Explore</h3>
                    <TransitionLink href="/#menu" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">The Menu</TransitionLink>
                    <TransitionLink href="/#about" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">About Us</TransitionLink>
                    <TransitionLink href="/#reserve" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">Reservations</TransitionLink>
                </div>

                {/* Column 2: Connect */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-sans text-xs tracking-[0.2em] font-bold opacity-50 uppercase mb-4">Connect</h3>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="font-serif text-2xl hover:opacity-70 transition-opacity flex items-center gap-2 w-fit group">
                        Instagram <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="font-serif text-2xl hover:opacity-70 transition-opacity flex items-center gap-2 w-fit group">
                        Twitter <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="mailto:hello@cloudbrew.com" className="font-serif text-2xl hover:opacity-70 transition-opacity flex items-center gap-2 w-fit group">
                        hello@cloudbrew.com <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Column 3: Legal (Stripe Compliance) */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-sans text-xs tracking-[0.2em] font-bold opacity-50 uppercase mb-4">Legal</h3>
                    <TransitionLink href="/privacy" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">Privacy Policy</TransitionLink>
                    <TransitionLink href="/terms" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">Terms of Service</TransitionLink>
                    <TransitionLink href="/terms" className="font-serif text-2xl hover:opacity-70 transition-opacity w-fit">Refund Policy</TransitionLink>
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="w-full max-w-7xl pt-8 border-t border-cb-cream/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                    onClick={handleSecretClick}
                    className="font-sans text-sm tracking-widest opacity-60 uppercase hover:opacity-100 transition-opacity focus:outline-none"
                    title="Copyright 2026"
                >
                    © 2026 Cloudbrew. All rights reserved.
                </button>
                <div className="font-sans text-sm tracking-widest opacity-60 uppercase flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    Operating Normally
                </div>
            </div>
        </footer>
    );
}
