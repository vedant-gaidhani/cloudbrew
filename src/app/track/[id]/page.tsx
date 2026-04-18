"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Coffee, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        // If it's a mock order, instantly resolve it without hitting Firebase
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || id.startsWith("mock-")) {
            setOrder({ id, status: "Brewing", customerName: "Valued Guest" });
            setLoading(false);
            return;
        }

        // Establish real-time WebSocket connection to the specific real order document
        const unsubscribe = onSnapshot(doc(db, "orders", id), (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                setOrder(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error listening to order:", error);
            setOrder(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cb-espresso flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-cb-cream/20 border-t-cb-cream animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-cb-espresso text-cb-cream flex flex-col items-center justify-center p-6 text-center">
                <Coffee className="w-16 h-16 opacity-50 mb-6" />
                <h1 className="font-serif text-3xl font-bold mb-4">Order Not Found</h1>
                <p className="font-sans tracking-widest uppercase opacity-70 mb-8 font-bold">This receipt may have vanished into the clouds.</p>
                <Link href="/" className="px-8 py-3 bg-cb-cream text-cb-espresso font-sans tracking-widest uppercase font-bold rounded-full hover:bg-white transition-colors">
                    Return to Reality
                </Link>
            </div>
        );
    }

    const steps = [
        { id: "Pending", label: "Receive", desc: "Order Transmitted", icon: Clock },
        { id: "Brewing", label: "Brewing", desc: "Crafting Clouds", icon: Coffee },
        { id: "Ready", label: "Ready", desc: "Awaiting Pickup", icon: CheckCircle2 },
    ];

    // Calculate progress for the background fill bar
    const getProgress = () => {
        if (order.status === "Pending") return "10%";
        if (order.status === "Brewing") return "50%";
        if (order.status === "Ready" || order.status === "Completed") return "100%";
        return "0%";
    };

    return (
        <main className="min-h-screen bg-cb-espresso text-cb-cream flex flex-col pt-12">
            {/* Header */}
            <header className="px-6 py-6 md:px-12 flex items-center justify-between z-20">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 tracking-widest uppercase font-sans text-xs font-bold hover:text-cb-cream/70 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Reality
                </button>
                <div className="font-serif text-xl tracking-tighter mix-blend-difference">
                    CLOUDBREW
                </div>
            </header>

            {/* Content Core */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto z-10 relative mt-[-10vh]">

                <div className="text-center mb-16 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-sans text-xs tracking-widest uppercase text-cb-cream/60 font-bold mb-4">
                            ORDER NO. {order.id.startsWith('mock-') ? order.id.toUpperCase() : order.id.substring(0, 8).toUpperCase()}
                        </p>
                        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter">
                            {order.status === "Ready" ? "It's Ready." : "Track Your Clouds"}
                        </h1>
                    </motion.div>
                </div>

                {/* Cinematic Tracker UI */}
                <div className="w-full relative px-4 md:px-12 mt-8">

                    {/* The Background Track */}
                    <div className="absolute top-1/2 left-8 right-8 h-[2px] bg-cb-cream/10 -translate-y-1/2 rounded-full overflow-hidden">
                        {/* The Animated Fill Line */}
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-cb-cream shadow-[0_0_15px_rgba(252,248,243,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: getProgress() }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    </div>

                    {/* The 3 Status Nodes */}
                    <div className="relative flex justify-between items-center w-full z-10">
                        {steps.map((step, index) => {
                            const isPast = steps.findIndex(s => s.id === order.status) > index;
                            const isActive = order.status === step.id;
                            const isReady = order.status === "Ready" || order.status === "Completed";

                            // If exactly Ready step and globally Ready, pulse green.
                            const isWinningNode = isActive && step.id === "Ready";

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-4 relative">
                                    {/* The Node Circle */}
                                    <motion.div
                                        layout
                                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-700
                                            ${isActive ? "bg-cb-cream text-cb-espresso shadow-[0_0_30px_rgba(252,248,243,0.3)] scale-110" :
                                                isPast || isReady ? "bg-cb-cream text-cb-espresso" :
                                                    "bg-cb-espresso border-2 border-cb-cream/20 text-cb-cream/40"
                                            }
                                            ${isWinningNode ? "bg-green-400 text-green-950 shadow-[0_0_40px_rgba(74,222,128,0.4)]" : ""}
                                        `}
                                        animate={isActive ? { y: [0, -5, 0] } : { y: 0 }}
                                        transition={isActive ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : {}}
                                    >
                                        <step.icon className={`w-4 h-4 md:w-6 md:h-6 ${isActive && !isWinningNode ? "animate-pulse" : ""}`} />
                                    </motion.div>

                                    {/* Text Labels */}
                                    <div className={`absolute top-16 md:top-20 text-center w-32 -mx-16 transition-opacity duration-500
                                        ${isActive ? "opacity-100" : isPast || isReady ? "opacity-60" : "opacity-30"}
                                    `}>
                                        <p className={`font-serif md:text-xl font-bold ${isWinningNode ? "text-green-400" : "text-cb-cream"}`}>
                                            {step.label}
                                        </p>
                                        <p className="font-sans text-[10px] md:text-xs tracking-widest uppercase font-bold mt-1 max-w-full">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dynamic Message Box below tracker */}
                <AnimatePresence mode="wait">
                    {order.status === "Ready" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="mt-32 p-6 rounded-2xl glass border border-green-400/20 bg-green-400/5 text-center w-full max-w-md"
                        >
                            <h3 className="font-serif text-2xl text-green-400 font-bold mb-2">Ready at the Counter</h3>
                            <p className="font-sans text-sm tracking-widest uppercase font-bold opacity-80">Show your order number to claim your brew.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Decorative background gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cb-cream/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#382B23] rounded-full blur-[150px]" />
            </div>
        </main>
    );
}
