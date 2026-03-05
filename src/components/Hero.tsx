"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const beanRef = useRef<HTMLImageElement>(null);
    const macaronRef = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        // Initial Stagger Animation
        gsap.fromTo(
            titleRef.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.5 }
        );

        gsap.fromTo(
            [beanRef.current, macaronRef.current],
            { y: 50, opacity: 0, scale: 0.8 },
            { y: 0, opacity: 1, scale: 1, duration: 2, ease: "power3.out", stagger: 0.2, delay: 0.8 }
        );

        // Antigravity Mouse Parallax
        const handleMouseMove = (e: MouseEvent) => {
            if (!heroRef.current) return;

            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / innerWidth;
            const y = (e.clientY - innerHeight / 2) / innerHeight;

            gsap.to(videoRef.current, {
                rotationY: x * 10,
                rotationX: -y * 10,
                ease: "power2.out",
                duration: 1,
                transformPerspective: 1000,
            });

            gsap.to(beanRef.current, {
                x: x * 100,
                y: y * 100,
                ease: "power3.out",
                duration: 1.5,
            });

            gsap.to(macaronRef.current, {
                x: -x * 60, // Opposite direction
                y: -y * 60,
                ease: "power3.out",
                duration: 1.5,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, { scope: heroRef });

    return (
        <section
            ref={heroRef}
            className="relative w-full h-screen flex items-center justify-center overflow-hidden perspective-1000"
        >
            {/* Background Video */}
            <div className="absolute inset-0 w-full h-full z-0 scale-110 object-cover">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-80"
                >
                    <source src="/assets/video/hero-loop.webm" type="video/webm" />
                </video>
            </div>

            {/* Floating Objects */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex items-center justify-center">
                <Image
                    ref={beanRef}
                    src="/assets/images/objects/bean-final.webp"
                    alt="Coffee Bean"
                    width={400}
                    height={400}
                    priority
                    className="absolute -right-[10%] top-[20%] w-[30vw] max-w-[400px] object-contain"
                />
                <Image
                    ref={macaronRef}
                    src="/assets/images/objects/macaron-final.webp"
                    alt="Macaron"
                    width={300}
                    height={300}
                    priority
                    className="absolute left-[5%] bottom-[15%] w-[20vw] max-w-[300px] object-contain"
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-20 flex flex-col items-center select-none mix-blend-multiply pointer-events-none">
                <h1
                    ref={titleRef}
                    className="font-serif text-[15vw] leading-none tracking-tighter text-cb-espresso font-bold mix-blend-multiply opacity-90"
                >
                    CLOUDBREW
                </h1>
                <p className="font-sans text-xl md:text-2xl mt-4 font-medium tracking-widest uppercase opacity-80">
                    The Creamy Dream Cafe
                </p>
            </div>
        </section>
    );
}
