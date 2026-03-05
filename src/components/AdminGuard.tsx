"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/store/useStore";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const setIsTransitioning = useStore((state) => state.setIsTransitioning);

    useEffect(() => {
        // If we're using mock credentials, just allow access to view the dashboard
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            console.warn("Using mock Firebase credentials. Bypassing Admin Authentication.");
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setLoading(false);
            } else {
                setIsAuthenticated(false);
                setLoading(false);
                // Redirect user to the new animated login page with Cream Curtain
                if (pathname !== "/admin/login") {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        router.push("/admin/login");
                        setTimeout(() => setIsTransitioning(false), 150);
                    }, 800);
                }
            }
        });

        return () => unsubscribe();
    }, [pathname, router, setIsTransitioning]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cb-cream flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-cb-espresso/30 border-t-cb-espresso animate-spin" />
            </div>
        );
    }

    // Do not render children if not authenticated unless we are already on the login page
    // The layout bypass handles letting the login page render
    if (!isAuthenticated && pathname !== "/admin/login") {
        return null; // The redirect is happening
    }

    return <>{children}</>;
}
