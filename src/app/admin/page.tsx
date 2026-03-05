"use client";

import { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot, addDoc } from "firebase/firestore";
import { db, MenuItem } from "@/lib/firebase";
import { Coffee, Calendar, DollarSign, CheckCircle, XCircle, Settings, Power, Plus, X } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function AdminDashboard() {
    const { menuItems, setMenuItems, reservations, setReservations, orders, setOrders, forceClosed, setForceClosed } = useStore();
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItem, setNewItem] = useState({
        name: "",
        description: "",
        price: "",
        category: "Coffee",
        image_url: "/assets/images/objects/bean-final.webp"
    });

    useEffect(() => {
        let unsubs: any[] = [];

        const setupRealtimeListeners = async () => {
            if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                // Initialize Mock State into Zustand if empty
                if (menuItems.length === 0) {
                    setMenuItems([
                        { id: "1", name: "Cloud Macchiato", description: "...", price: 8.50, image_url: "", category: "Coffee", is_popular: true, is_available: true },
                        { id: "2", name: "Lavender Latte", description: "...", price: 7.00, image_url: "", category: "Coffee", is_popular: true, is_available: true },
                        { id: "3", name: "Velvet Matcha", description: "...", price: 9.00, image_url: "", category: "Coffee", is_popular: true, is_available: true },
                        { id: "4", name: "Dream Brew", description: "...", price: 6.50, image_url: "", category: "Coffee", is_popular: true, is_available: true },
                    ]);
                }
                if (reservations.length === 0) {
                    setReservations([
                        { id: "res1", name: "Vedant", email: "mock@cloudbrew.com", phone: "123-456-7890", guests: 2, date: "2024-03-30", time: "10:00", status: "confirmed" }
                    ]);
                }
                if (orders.length === 0) {
                    setOrders([
                        { id: "ord1", customerName: "Vedant", customerEmail: "v@example.com", amountTotal: 15.50, status: "Pending", createdAt: new Date() }
                    ]);
                }
                setLoading(false);
                return;
            }

            try {
                // Settings Override Snapshot
                unsubs.push(onSnapshot(doc(db, "settings", "store_status"), (docSnap) => {
                    if (docSnap.exists()) setForceClosed(docSnap.data().force_closed === true);
                }));

                // Menu Items Snapshot
                unsubs.push(onSnapshot(collection(db, "menu_items"), (snap) => {
                    setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[]);
                }));

                // Reservations Snapshot
                unsubs.push(onSnapshot(collection(db, "reservations"), (snap) => {
                    setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]); // Type cast to any[] first since Firestore data is dynamic, useStore handles the strict type
                }));

                // Orders Snapshot
                unsubs.push(onSnapshot(collection(db, "orders"), (snap) => {
                    setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]);
                }));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        setupRealtimeListeners();

        // Cleanup function properly reverts listeners via Zustand/useEffect standards
        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, []);

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setMenuItems(menuItems.map(item => item.id === id ? { ...item, is_available: !currentStatus } : item));
            return;
        }
        await updateDoc(doc(db, "menu_items", id), { is_available: !currentStatus }).catch(console.error);
    };

    const updateOrderStatus = async (id: string, newStatus: string) => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
            return;
        }
        await updateDoc(doc(db, "orders", id), { status: newStatus }).catch(console.error);
    };

    const updateReservationStatus = async (id: string, newStatus: string) => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setReservations(reservations.map(res => res.id === id ? { ...res, status: newStatus } : res));
            return;
        }
        await updateDoc(doc(db, "reservations", id), { status: newStatus }).catch(console.error);
    };

    const handleForceCloseToggle = async () => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setForceClosed(!forceClosed);
            return;
        }
        await updateDoc(doc(db, "settings", "store_status"), { force_closed: !forceClosed }).catch(console.error);
    };

    const handleCreateItem = async (e: React.FormEvent) => {
        e.preventDefault();

        const itemData = {
            ...newItem,
            price: parseFloat(newItem.price),
            is_available: true,
            is_popular: false
        };

        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setMenuItems([...menuItems, { id: Date.now().toString(), ...itemData } as MenuItem]);
            setIsAddingItem(false);
            setNewItem({ name: "", description: "", price: "", category: "Coffee", image_url: "/assets/images/objects/bean-final.webp" });
            return;
        }

        try {
            await addDoc(collection(db, "menu_items"), itemData);
            setIsAddingItem(false);
            setNewItem({ name: "", description: "", price: "", category: "Coffee", image_url: "/assets/images/objects/bean-final.webp" });
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    if (loading) return <div>Loading Cloudbrew Data...</div>;

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
            <header className="flex justify-between items-end border-b border-cb-espresso/10 pb-6 mt-4 md:mt-0">
                <div>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2 flex items-center gap-4">Overview </h2>
                    <p className="font-sans text-xs md:text-sm tracking-widest uppercase opacity-60">Manage your surreal experience</p>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={handleForceCloseToggle}
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-xl font-sans text-[10px] md:text-xs tracking-widest uppercase font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${forceClosed ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                        <Power className="w-4 h-4 hidden md:block" />
                        {forceClosed ? "CLOSED" : "BREWING"}
                    </button>
                    <div className="p-3 bg-white/50 rounded-xl border border-cb-espresso/10 hidden md:block"><Settings className="w-5 h-5 text-cb-espresso opacity-70" /></div>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">To-Do Orders</p>
                        <p className="font-serif text-4xl font-bold">{orders.filter((o: any) => o.status !== "Completed").length}</p>

                    </div>
                    <DollarSign className="w-10 h-10 opacity-20" />
                </div>
                <div id="reservations" className="glass p-6 rounded-2xl flex items-center justify-between scroll-mt-24">
                    <div>
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">Upcoming Reservations</p>
                        <p className="font-serif text-4xl font-bold">{reservations.length}</p>
                    </div>
                    <Calendar className="w-10 h-10 opacity-20" />
                </div>
                <div id="menu" className="glass p-6 rounded-2xl flex items-center justify-between scroll-mt-24">
                    <div>
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">Total Menu Items</p>
                        <p className="font-serif text-4xl font-bold">{menuItems.length}</p>
                    </div>
                    <Coffee className="w-10 h-10 opacity-20" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Orders Command Center */}
                <div id="orders" className="flex flex-col gap-6 lg:col-span-1 scroll-mt-24">
                    <h3 className="font-serif text-3xl font-bold border-b border-cb-espresso/10 pb-4">Live Orders</h3>
                    <div className="flex flex-col gap-4">
                        {orders.map(order => (
                            <div key={order.id} className={`glass p-5 rounded-xl flex flex-col gap-3 transition-colors ${order.status === "Completed" ? "opacity-50 grayscale" : "border-cb-espresso/20"}`}>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-serif font-bold text-xl">{order.customerName}</h4>
                                    <span className="font-sans font-bold text-cb-espresso/70">${Number(order.amountTotal).toFixed(2)}</span>
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className="bg-cb-cream/50 text-cb-espresso font-sans text-xs tracking-widest uppercase font-bold p-2 rounded outline-none border border-cb-espresso/10 cursor-pointer"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Preparing">Preparing...</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reservations Feed */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    <h3 className="font-serif text-3xl font-bold border-b border-cb-espresso/10 pb-4">Upcoming Tables</h3>
                    <div className="flex flex-col gap-4">
                        {reservations.map(res => (
                            <div key={res.id} className={`glass p-5 rounded-xl flex flex-col gap-2 ${res.status === "Declined" ? "opacity-30" : ""}`}>
                                <div className="flex justify-between items-start">
                                    <h4 className="font-serif font-bold text-xl">{res.name}</h4>
                                    <span className="px-3 py-1 bg-cb-espresso text-cb-cream rounded-full font-sans text-[10px] tracking-widest uppercase font-bold">
                                        {res.guests} Guests
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-sans font-medium opacity-70 mb-2">
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {res.date}</span>
                                    <span className="flex items-center gap-2"><Coffee className="w-4 h-4" /> {res.time}</span>
                                </div>
                                <div className="flex gap-2 w-full mt-1 border-t border-cb-espresso/10 pt-3">
                                    <button onClick={() => updateReservationStatus(res.id, "Approved")} className={`flex-1 font-sans text-[10px] tracking-widest uppercase font-bold rounded p-2 transition-colors ${res.status === "Approved" ? "bg-green-100 text-green-700" : "bg-white/50 hover:bg-white"}`}>Aprove</button>
                                    <button onClick={() => updateReservationStatus(res.id, "Declined")} className={`flex-1 font-sans text-[10px] tracking-widest uppercase font-bold rounded p-2 transition-colors ${res.status === "Declined" ? "bg-red-100 text-red-700" : "bg-white/50 hover:bg-white"}`}>Decline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu Management */}
                <div className="flex flex-col gap-6 lg:col-span-1">
                    <div className="flex justify-between items-center border-b border-cb-espresso/10 pb-4">
                        <h3 className="font-serif text-3xl font-bold">Menu Stock</h3>
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="bg-cb-espresso text-cb-cream p-2 rounded-full hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="glass p-4 rounded-xl flex items-center justify-between transition-all hover:bg-white/60">
                                <span className="font-serif font-bold text-lg">{item.name}</span>
                                <button
                                    onClick={() => toggleAvailability(item.id, item.is_available)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-[10px] tracking-widest uppercase font-bold transition-colors ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                >
                                    {item.is_available ? <><CheckCircle className="w-3 h-3" /> Instock</> : <><XCircle className="w-3 h-3" /> Sold Out</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add New Item Modal */}
            {isAddingItem && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-cb-espresso/40 backdrop-blur-sm"
                        onClick={() => setIsAddingItem(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-cb-cream w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-cb-espresso/10">
                            <h3 className="font-serif text-2xl font-bold text-cb-espresso">New Creation</h3>
                            <button onClick={() => setIsAddingItem(false)} className="text-cb-espresso/50 hover:text-cb-espresso">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateItem} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block font-sans text-[10px] tracking-widest uppercase font-bold text-cb-espresso/70 mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-serif text-lg"
                                    placeholder="Ethereal Flat White"
                                />
                            </div>

                            <div>
                                <label className="block font-sans text-[10px] tracking-widest uppercase font-bold text-cb-espresso/70 mb-1">Description</label>
                                <textarea
                                    required
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-sans text-sm resize-none h-24"
                                    placeholder="A luxurious blend of..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-sans text-[10px] tracking-widest uppercase font-bold text-cb-espresso/70 mb-1">Price ($)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-sans"
                                        placeholder="8.50"
                                    />
                                </div>
                                <div>
                                    <label className="block font-sans text-[10px] tracking-widest uppercase font-bold text-cb-espresso/70 mb-1">Category</label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-sans text-sm"
                                    >
                                        <option value="Coffee">Coffee</option>
                                        <option value="Pastry">Pastry</option>
                                        <option value="Merchandise">Merchandise</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-sans text-[10px] tracking-widest uppercase font-bold text-cb-espresso/70 mb-1">Image URL</label>
                                <input
                                    required
                                    type="text"
                                    value={newItem.image_url}
                                    onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                                    className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-sans text-sm opacity-60"
                                />
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full bg-cb-espresso text-cb-cream rounded-xl p-4 font-sans text-xs tracking-widest uppercase font-bold hover:scale-[1.02] transition-transform"
                            >
                                Craft Item
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
