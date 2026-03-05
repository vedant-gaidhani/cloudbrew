"use client";

import Link from "next/link";
import TransitionLink from "@/components/TransitionLink";
import { Coffee, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
    const { toggleCart, getCartCount, forceClosed, setForceClosed } = useStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Real-time Firestore sync for store_status override
        let unsubscribe = () => { };
        if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            unsubscribe = onSnapshot(doc(db, "settings", "store_status"), (docSnap) => {
                if (docSnap.exists()) {
                    setForceClosed(docSnap.data().force_closed === true);
                }
            });
        }

        return () => {
            unsubscribe();
        };
    }, [setForceClosed]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-center mix-blend-difference text-cb-cream">
                <TransitionLink href="/" className="flex items-center gap-2 group">
                    <Coffee className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-serif text-xl tracking-widest font-bold">C B .</span>
                </TransitionLink>

                <div className="flex items-center gap-6 md:gap-8 font-sans text-sm tracking-widest font-medium">
                    {/* Dynamic Status Badge controlled strictly by Admin override */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] md:text-xs ${forceClosed ? 'border-red-400 text-red-400' : 'border-green-400 text-green-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${forceClosed ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></div>
                        <span className="hidden sm:block">{forceClosed ? 'STORE CLOSED' : 'BREWING'}</span>
                        <span className="block sm:hidden">{forceClosed ? 'CLOSED' : 'OPEN'}</span>
                    </div>

                    <TransitionLink href="/#menu" className="hidden md:block hover:opacity-70 transition-opacity">MENU</TransitionLink>
                    <TransitionLink href="/#about" className="hidden md:block hover:opacity-70 transition-opacity">ABOUT</TransitionLink>
                    <TransitionLink href="/#reserve" className="hidden md:block hover:opacity-70 transition-opacity">RESERVE</TransitionLink>

                    <button
                        onClick={toggleCart}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity relative group"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                        <span className="hidden sm:block">CART</span>
                        {getCartCount() > 0 && (
                            <span className="absolute -top-2 -right-2 bg-cb-cream text-cb-espresso text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {getCartCount()}
                            </span>
                        )}
                    </button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="md:hidden p-1 hover:opacity-70 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Full-Screen Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-[100] bg-cb-espresso text-cb-cream flex flex-col items-center justify-center transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}
            >
                <button
                    className="absolute top-6 right-6 p-2 hover:opacity-70 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X className="w-8 h-8" />
                </button>

                <div className="flex flex-col gap-12 text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <TransitionLink href="/" className="font-serif text-5xl font-bold hover:text-cb-cream/50 transition-colors">HOME</TransitionLink>
                    <TransitionLink href="/#menu" className="font-serif text-5xl font-bold hover:text-cb-cream/50 transition-colors">MENU</TransitionLink>
                    <TransitionLink href="/#about" className="font-serif text-5xl font-bold hover:text-cb-cream/50 transition-colors">ABOUT</TransitionLink>
                    <TransitionLink href="/#reserve" className="font-serif text-5xl font-bold hover:text-cb-cream/50 transition-colors">RESERVE</TransitionLink>
                </div>
            </div>
        </>
    );
}
