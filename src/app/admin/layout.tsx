"use client";

import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, ShoppingBag, CalendarDays, Coffee, Power } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Bypass sidebar entirely for the login route
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-[#F8EDE3] relative text-cb-espresso">
            <AdminGuard>
                <div className="flex min-h-screen font-sans">
                    {/* Sidebar (Desktop) */}
                    <aside className="w-64 border-r border-cb-espresso/10 p-6 flex flex-col gap-8 bg-[#F8EDE3] hidden md:flex sticky top-0 h-screen overflow-hidden shadow-xl shrink-0 z-50">
                        <h1 className="font-serif text-3xl font-bold tracking-tight">Cloudbrew Admin</h1>
                        <nav className="flex flex-col gap-4 flex-1">
                            <Link href="/admin" className="font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity">Dashboard</Link>
                            <button onClick={() => document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity text-left">Orders</button>
                            <button onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity text-left">Reservations</button>
                            <button onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="font-medium tracking-widest uppercase text-sm opacity-50 hover:opacity-100 transition-opacity text-left">Menu Items</button>
                        </nav>
                        {/* Bottom Actions */}
                        <div className="absolute bottom-12 left-0 w-full px-8 hidden md:block">
                            <button
                                onClick={() => signOut(auth)}
                                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/50 hover:shadow-sm border border-transparent hover:border-cb-espresso/10 transition-all font-sans text-xs tracking-widest uppercase font-bold text-red-500 hover:text-red-700 w-full bg-white/20"
                            >
                                <Power className="w-5 h-5" />
                                <span>Logout</span>
                            </button>
                        </div>

                        <div className="absolute bottom-4 left-0 w-full px-8 pt-6">
                            <Link href="/" className="flex items-center gap-2 font-bold tracking-widest uppercase text-sm hover:opacity-70 transition-opacity text-cb-espresso/80">
                                <ArrowLeft className="w-4 h-4" />
                                Return to Site
                            </Link>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-[1] p-6 pb-32 md:p-12 w-full max-w-[100vw]">
                        {children}
                    </main>

                    {/* Mobile Bottom Navigation */}
                    <nav className="fixed bottom-0 left-0 w-full bg-[#F8EDE3] border-t border-cb-espresso/10 p-3 pt-4 pb-navbar-safe flex justify-between items-center md:hidden z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex flex-col items-center gap-1 opacity-100 flex-1"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-center w-full">Dash</span>
                        </button>
                        <button
                            onClick={() => document.getElementById('orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity flex-1"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-center w-full">Orders</span>
                        </button>
                        <button
                            onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity flex-1"
                        >
                            <CalendarDays className="w-5 h-5" />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-center w-full">Tables</span>
                        </button>
                        <button
                            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity flex-1"
                        >
                            <Coffee className="w-5 h-5" />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-center w-full">Menu</span>
                        </button>
                        <button
                            onClick={() => signOut(auth)}
                            className="flex flex-col items-center gap-1 text-red-500 hover:text-red-700 transition-colors flex-1"
                        >
                            <Power className="w-5 h-5" />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-center w-full">Logout</span>
                        </button>
                    </nav>
                </div>
            </AdminGuard>
        </div>
    );
}
