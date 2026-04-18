"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ChevronLeft, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// The Exclusive Item Definition
const MIDNIGHT_MACCHIATO = {
    id: "item_midnight_macchiato_001",
    name: "The Midnight Macchiato",
    description: "A digital anomaly. Served cold. Tastes like static.",
    price: 50.00,
    category: "Restricted",
    is_popular: false,
    image_url: "", // Intentionally blank for the glitch aesthetic
    in_stock: true,
    is_available: true
};

export default function MidnightVaultPage() {
    const [mounted, setMounted] = useState(false);
    const { addToCart, setCartOpen } = useStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    /* Optional Time-Gate Check (Uncomment to enforce real-world midnight access)
    useEffect(() => {
        const hour = new Date().getHours();
        // 0 = 12 AM, 4 = 4 AM. If you are not in this window, kick them out.
        if (hour >= 4 && hour < 24) {
             router.push('/'); 
             // Or show a message: "The clouds are sleeping. Return at midnight."
        }
    }, [router]);
    */

    if (!mounted) return null;

    const handleAddToCart = () => {
        addToCart(MIDNIGHT_MACCHIATO);
        setCartOpen(true);
    };

    // Glitch Animation Variants
    const glitchVariants: Variants = {
        initial: { opacity: 0, x: -10 },
        animate: {
            opacity: [0, 1, 0.8, 1, 0.4, 1],
            x: [0, -5, 5, -2, 2, 0],
            filter: [
                "hue-rotate(0deg)",
                "hue-rotate(90deg)",
                "hue-rotate(-45deg)",
                "hue-rotate(0deg)"
            ],
            transition: {
                duration: 0.5,
                ease: "circInOut",
                repeat: Infinity,
                repeatDelay: Math.random() * 3 + 2, // Random delay between glitches
            }
        }
    };

    const floatVariants: Variants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity
            }
        }
    };

    return (
        <main className="min-h-screen bg-black text-purple-400 font-mono overflow-hidden flex flex-col selection:bg-purple-900 selection:text-white relative">

            {/* Background CRT Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px' }} />

            {/* Header */}
            <header className="p-6 md:p-12 z-20 flex justify-between items-center w-full relative">
                <Link
                    href="/"
                    className="flex items-center gap-2 hover:text-white transition-colors uppercase tracking-[0.3em] text-xs opacity-50 hover:opacity-100"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Disconnect
                </Link>
                <div className="flex items-center gap-2 opacity-50 animate-pulse">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs tracking-widest uppercase">Root Access</span>
                </div>
            </header>

            {/* Core Vault Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-4xl mx-auto">

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="relative w-full max-w-md"
                >
                    {/* Glowing Orbs behind the card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none animate-pulse z-0" />

                    {/* The Artifact Card */}
                    <motion.div
                        variants={floatVariants}
                        animate="animate"
                        className="relative z-10 border border-purple-500/30 bg-black/50 backdrop-blur-md p-8 md:p-12 rounded-sm shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center text-center"
                    >
                        <motion.div
                            variants={glitchVariants}
                            initial="initial"
                            animate="animate"
                            className="mb-8"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
                                The Midnight<br />Macchiato
                            </h1>
                        </motion.div>

                        <p className="text-sm tracking-[0.2em] uppercase opacity-70 mb-12 max-w-xs leading-relaxed drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                            {MIDNIGHT_MACCHIATO.description}
                        </p>

                        <div className="flex flex-col items-center gap-6 w-full">
                            <span className="text-2xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
                                ${MIDNIGHT_MACCHIATO.price.toFixed(2)}
                            </span>

                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCart}
                                className="w-full py-4 border border-purple-500/50 uppercase tracking-[0.3em] text-sm font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 relative overflow-hidden group"
                            >
                                <span className="relative z-10 text-purple-300 group-hover:text-white transition-colors drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">Execute Order</span>
                                {/* Hover glitch effect block */}
                                <div className="absolute inset-0 bg-purple-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>

            </div>

        </main>
    );
}
