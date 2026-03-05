"use client";

import { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLVideoElement>(null);
    const elementsRef = useRef<(HTMLElement | null)[]>([]);

    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Ken Burns Effect on Right Side Image
        tl.fromTo(imageRef.current,
            { scale: 1.1 },
            { scale: 1, duration: 2.5, ease: "power2.out" }
            , 0);

        // 2. Left Side Form Container Slides In
        tl.fromTo(formRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
            , 0.2);

        // 3. Stagger Title, Inputs, Button
        tl.fromTo(elementsRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
            , 0.5);

    }, { scope: containerRef });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err: any) {
            setError("Authentication Failed. Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    const addToRefs = (el: HTMLElement | null) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-screen bg-cb-espresso flex overflow-hidden">
            {/* Left Side: The Glass Vault */}
            <div
                ref={formRef}
                className="w-full lg:w-[40%] h-full flex flex-col items-center justify-center p-8 lg:p-16 relative z-10"
            >
                <div className="w-full max-w-sm backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">

                    <div className="mb-12" ref={addToRefs}>
                        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-cb-cream mb-2 tracking-tighter">
                            CLOUDBREW OS
                        </h1>
                        <p className="font-sans text-xs tracking-[0.2em] font-medium text-cb-cream/60 uppercase">
                            Enter Admin Credentials
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-8">
                        <div className="relative group" ref={addToRefs}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-transparent border-b border-cb-cream/20 py-3 text-cb-cream font-sans outline-none focus:border-cb-cream transition-colors placeholder:text-transparent peer"
                                placeholder="Email"
                            />
                            <label className="absolute left-0 top-3 text-cb-cream/50 font-sans text-sm tracking-widest uppercase transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cb-cream peer-valid:-top-4 peer-valid:text-xs peer-valid:text-cb-cream/70 pointer-events-none">
                                Email Address
                            </label>
                        </div>

                        <div className="relative group" ref={addToRefs}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-transparent border-b border-cb-cream/20 py-3 text-cb-cream font-sans outline-none focus:border-cb-cream transition-colors placeholder:text-transparent peer"
                                placeholder="Password"
                            />
                            <label className="absolute left-0 top-3 text-cb-cream/50 font-sans text-sm tracking-widest uppercase transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-cb-cream peer-valid:-top-4 peer-valid:text-xs peer-valid:text-cb-cream/70 pointer-events-none">
                                Password
                            </label>
                        </div>

                        {error && (
                            <div className="text-red-400 font-sans text-xs tracking-wider bg-red-400/10 px-4 py-3 rounded border border-red-400/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            ref={addToRefs}
                            className="w-full bg-cb-cream text-cb-espresso py-4 rounded-none font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 rounded-full border-2 border-cb-espresso/30 border-t-cb-espresso animate-spin"></div>
                            ) : "Authenticate"}
                        </button>
                    </form>

                    <div className="mt-12 w-full text-center" ref={addToRefs}>
                        <p className="font-sans text-[10px] tracking-widest text-cb-cream/30 uppercase">
                            Secure Terminal Connection
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: The Visual (Hidden on mobile) */}
            <div className="hidden lg:block w-[60%] h-full p-6 relative">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative border border-white/5">
                    {/* Dark gradient overlay for extreme contrast */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cb-espresso via-transparent to-transparent z-10 opacity-50"></div>

                    {/* Cinematic Video Background */}
                    <video
                        ref={imageRef}
                        src="/assets/video/admin-bg.webm"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center transform origin-center"
                    />
                </div>
            </div>
        </div>
    );
}
