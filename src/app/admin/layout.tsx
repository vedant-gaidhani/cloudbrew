"use client";

import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Bypass sidebar entirely for the login route
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#F8EDE3] relative z-[9999] isolation-auto">
            <AdminGuard>
                <div className="flex bg-cb-cream text-cb-espresso min-h-screen font-sans">
                    {/* Sidebar */}
                    <aside className="w-64 border-r border-cb-espresso/10 p-6 flex flex-col gap-8 bg-white/50 backdrop-blur-md hidden md:flex">
                        <h1 className="font-serif text-3xl font-bold tracking-tight">Cloudbrew Admin</h1>
                        <nav className="flex flex-col gap-4 flex-1">
                            <Link href="/admin" className="font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity">Dashboard</Link>
                            <Link href="#" className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity">Orders</Link>
                            <Link href="#" className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity">Reservations</Link>
                            <Link href="#" className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity">Menu Items</Link>
                        </nav>

                        <div className="mt-auto border-t border-cb-espresso/10 pt-6">
                            <Link href="/" className="flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity text-cb-espresso/80">
                                <ArrowLeft className="w-4 h-4" />
                                Return to Site
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full">
                        {children}
                    </main>
                </div>
            </AdminGuard>
        </div>
    );
}
