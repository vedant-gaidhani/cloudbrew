"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CartDrawer() {
    const { isCartOpen, toggleCart, cart, updateQuantity, removeFromCart, getCartTotal, forceClosed, setOrders, orders, clearCart, menuItems, addToCart } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    // Compute trending items: prefer `is_popular`, fallback to first 3 items, excluding active cart nodes
    const trendingItems = menuItems.filter(item => item.is_popular && !cart.some(c => c.id === item.id)).slice(0, 3);
    const displayTrending = trendingItems.length > 0
        ? trendingItems
        : menuItems.filter(item => !cart.some(c => c.id === item.id)).slice(0, 3);

    // Avoid hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-cb-espresso/50 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-[100dvh] w-full md:max-w-md bg-cb-cream z-[100] transform transition-transform duration-500 ease-out shadow-2xl flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-cb-espresso/10">
                    <h2 className="font-serif text-2xl md:text-3xl text-cb-espresso font-bold flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                        Your Order
                    </h2>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-cb-espresso/5 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-cb-espresso" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 md:gap-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-cb-espresso/50">
                            <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                            <p className="font-sans text-lg tracking-widest uppercase text-center">Your cart is floating empty</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center bg-white/50 p-4 rounded-xl border border-cb-espresso/5">
                                {item.image_url && (
                                    <div className="w-16 h-16 md:w-20 md:h-20 relative bg-cb-espresso/5 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image_url} alt={item.name} className="object-cover w-full h-full mix-blend-multiply" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="font-serif font-bold text-lg md:text-xl text-cb-espresso">{item.name}</h3>
                                    <p className="font-sans text-sm md:text-base text-cb-espresso font-medium">${item.price.toFixed(2)}</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-cb-espresso/20 rounded-full bg-white scale-90 md:scale-100 origin-left">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:bg-cb-espresso/5 rounded-full transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-sans font-medium text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:bg-cb-espresso/5 rounded-full transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[10px] md:text-xs font-sans tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Trending Now Section */}
                    {displayTrending.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-cb-espresso/10">
                            <h3 className="font-serif text-lg font-bold text-cb-espresso mb-4">Trending Now</h3>
                            <div className="flex flex-col gap-3">
                                {displayTrending.map(item => (
                                    <div key={item.id} className="flex gap-3 items-center bg-white/30 p-3 rounded-xl border border-cb-espresso/5 hover:bg-white/50 transition-colors">
                                        {item.image_url && (
                                            <div className="w-12 h-12 relative bg-cb-espresso/5 rounded-lg overflow-hidden flex-shrink-0">
                                                <img src={item.image_url} alt={item.name} className="object-cover w-full h-full mix-blend-multiply" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-serif font-bold text-sm text-cb-espresso truncate">{item.name}</h4>
                                            <p className="font-sans text-xs font-medium text-cb-espresso/70">${item.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => addToCart(item)}
                                            className="w-8 h-8 flex items-center justify-center bg-cb-espresso text-cb-cream rounded-full hover:scale-105 active:scale-95 transition-transform shrink-0"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Checkout */}
                {cart.length > 0 && (
                    <div className="p-6 pb-12 md:pb-6 border-t border-cb-espresso/10 bg-white/50 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-sans tracking-widest uppercase text-sm font-medium text-cb-espresso/70">Subtotal</span>
                            <span className="font-serif text-2xl md:text-3xl font-bold text-cb-espresso">${getCartTotal().toFixed(2)}</span>
                        </div>

                        <button
                            onClick={async () => {
                                if (forceClosed) return;
                                try {
                                    setIsCheckoutLoading(true);

                                    // 1. First, create the "Received" order document locally in Firestore
                                    let activeOrderId = "mock-ord-" + Math.random().toString(36).substring(7);

                                    // If we are actually connected to a live Firebase config
                                    if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                                        try {
                                            const docRef = await addDoc(collection(db, "orders"), {
                                                customerName: "Valued Guest",
                                                customerEmail: "guest@cloudbrew.com",
                                                amountTotal: getCartTotal(),
                                                status: "Received",
                                                createdAt: serverTimestamp(),
                                                items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
                                            });
                                            activeOrderId = docRef.id;
                                        } catch (e) {
                                            console.error("Failed to pre-create Firebase Order:", e);
                                        }
                                    }

                                    // 2. Mock Flow immediately if no Stripe Key
                                    if (!process.env.STRIPE_SECRET_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                                        setOrders([...orders, { id: activeOrderId, customerName: "Test Customer", customerEmail: "test@cloudbrew.com", amountTotal: getCartTotal(), status: "Received" }]);
                                        clearCart();
                                        window.location.href = `/success?order_id=${activeOrderId}`;
                                        return;
                                    }

                                    // 3. Shoot to the internal API route with the ID
                                    const response = await fetch('/api/create-checkout-session', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ items: cart, orderId: activeOrderId }),
                                    });

                                    const data = await response.json();

                                    if (data.url) {
                                        window.location.href = data.url;
                                    } else {
                                        console.error("Checkout failed:", data.error);
                                        alert("Failed to initiate checkout. Please try again.");
                                    }
                                } catch (err) {
                                    console.error("Network error during checkout:", err);
                                    alert("Network error. Please try again.");
                                } finally {
                                    setIsCheckoutLoading(false);
                                }
                            }}
                            disabled={isCheckoutLoading || forceClosed}
                            className={`w-full py-4 rounded-full font-sans tracking-widest uppercase font-bold transition-colors flex items-center justify-center gap-2 ${forceClosed ? 'bg-red-500/20 text-red-500 cursor-not-allowed' : 'bg-cb-espresso text-cb-cream hover:bg-cb-espresso/90 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            {forceClosed ? 'Store Closed' : isCheckoutLoading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-cb-cream/30 border-t-cb-cream animate-spin" />
                                    Processing...
                                </>
                            ) : 'Checkout Seamlessly'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
