import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="glass max-w-lg w-full p-12 rounded-3xl text-center flex flex-col items-center">
                <XCircle className="w-16 h-16 text-red-500 mb-6" />
                <h1 className="font-serif text-5xl font-bold mb-4">Checkout Cancelled</h1>
                <p className="font-sans text-xl opacity-80 mb-8 leading-relaxed">
                    Your cart is still saved if you wish to try again later.
                </p>
                <Link
                    href="/"
                    className="px-8 py-4 bg-cb-espresso text-cb-cream rounded-full font-sans text-sm tracking-widest uppercase font-bold hover:bg-cb-espresso/90 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
