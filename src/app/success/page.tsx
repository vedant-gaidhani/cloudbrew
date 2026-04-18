"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/store/useStore";
import TransitionLink from "@/components/TransitionLink";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const orderIdParam = searchParams.get("order_id");
    const { clearCart, orders } = useStore();

    // Prefer the explicit order_id returned from the API bridge, otherwise fallback to local Zustand cache
    const latestOrderId = orders.length > 0 ? orders[orders.length - 1].id : null;
    const trackingId = orderIdParam || latestOrderId || sessionId;

    const imageRef = useRef<HTMLImageElement>(null);
    const textElementsRef = useRef<(HTMLElement | null)[]>([]);

    // 1. Clear the cart immediately since checkout succeeded
    useEffect(() => {
        if (sessionId) {
            clearCart();
        }
    }, [sessionId, clearCart]);

    // 2. Cinematic Entrance Animations
    useGSAP(() => {
        const tl = gsap.timeline();

        // The Breathing Monument Image (infinite scale loop)
        if (imageRef.current) {
            gsap.to(imageRef.current, {
                scale: 1.05,
                duration: 10,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        }

        // The Text Stagger In
        tl.from(textElementsRef.current, {
            y: 40,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.2 // Small delay to let the page settle
        });

    }, []);

    return (
        <div className="min-h-screen w-full bg-cb-espresso text-cb-cream overflow-hidden flex flex-col md:flex-row">

            {/* Left Side: The Message */}
            <div className="w-full md:w-1/2 h-screen flex flex-col items-center justify-center p-8 md:p-16 z-10 relative">
                <div className="max-w-md w-full flex flex-col items-start gap-6">
                    <span
                        ref={(el) => { textElementsRef.current[0] = el; }}
                        className="font-sans text-xs tracking-[0.3em] font-bold uppercase text-cb-cream/60 glow-subtle"
                    >
                        Order Confirmed
                    </span>

                    <h1
                        ref={(el) => { textElementsRef.current[1] = el; }}
                        className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none"
                    >
                        Payment<br />Secured.
                    </h1>

                    <p
                        ref={(el) => { textElementsRef.current[2] = el; }}
                        className="font-serif text-2xl md:text-3xl italic text-cb-cream/80 mt-4"
                    >
                        The machine is currently brewing your clouds.
                    </p>

                    <div
                        ref={(el) => { textElementsRef.current[3] = el; }}
                        className="mt-12"
                    >
                        <TransitionLink
                            href={trackingId ? `/track/${trackingId}` : "/"}
                            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden border border-cb-cream/30 rounded-full font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-cb-cream hover:text-cb-espresso transition-colors duration-500"
                        >
                            <span className="relative z-10 transition-transform duration-500 group-hover:-translate-y-[150%]">
                                {trackingId ? "Track Your Clouds" : "Return to Reality"}
                            </span>
                            <span className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center transition-transform duration-500 translate-y-[150%] group-hover:translate-y-0 pb-4">
                                {trackingId ? "Track Your Clouds" : "Return to Reality"}
                            </span>
                        </TransitionLink>
                    </div>

                    {/* Subtle aesthetic lines */}
                    <div
                        ref={(el) => { textElementsRef.current[4] = el; }}
                        className="w-px h-24 bg-cb-cream/20 absolute bottom-0 left-16 hidden md:block"
                    />
                </div>
            </div>

            {/* Right Side: The Monument */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden order-first md:order-last border-b md:border-b-0 md:border-l border-cb-cream/10">
                {/* Image Container with the infinite breathing scale */}
                <div className="w-full h-full relative">
                    <img
                        ref={imageRef}
                        src="/assets/images/success-machine.webp"
                        alt="The Cloudbrew Machine"
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Gradient Fades to blend into the espresso background */}
                <div className="absolute inset-0 bg-gradient-to-t from-cb-espresso via-transparent to-transparent opacity-80 md:hidden"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cb-espresso via-transparent to-transparent opacity-50 hidden md:block"></div>
                <div className="absolute inset-0 bg-cb-espresso/20 mix-blend-overlay"></div>
            </div>

        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-cb-espresso flex items-center justify-center text-cb-cream/60 tracking-widest text-xs uppercase font-sans">Verifying Link...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
