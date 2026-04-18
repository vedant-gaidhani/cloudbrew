"use client";

import { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { db, MenuItem } from "@/lib/firebase";
import { Coffee, Calendar, DollarSign, CheckCircle, XCircle, Settings, Power, Plus, X, Trash2, Edit2, TrendingUp } from "lucide-react";
import { useStore } from "@/store/useStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const weeklyRevenueData = [
    { name: 'Mon', revenue: 420 },
    { name: 'Tue', revenue: 380 },
    { name: 'Wed', revenue: 510 },
    { name: 'Thu', revenue: 480 },
    { name: 'Fri', revenue: 890 },
    { name: 'Sat', revenue: 1240 },
    { name: 'Sun', revenue: 1100 },
];

export default function AdminDashboard() {
    const { menuItems, setMenuItems, reservations, setReservations, orders, setOrders, forceClosed, setForceClosed } = useStore();
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();

        const itemData = {
            ...newItem,
            price: parseFloat(newItem.price),
            is_available: true,
            is_popular: false
        };

        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            if (editingItemId) {
                setMenuItems(menuItems.map(item => item.id === editingItemId ? { id: editingItemId, ...itemData } as MenuItem : item));
            } else {
                setMenuItems([...menuItems, { id: Date.now().toString(), ...itemData } as MenuItem]);
            }
            setIsAddingItem(false);
            setEditingItemId(null);
            setNewItem({ name: "", description: "", price: "", category: "Coffee", image_url: "/assets/images/objects/bean-final.webp" });
            return;
        }

        try {
            if (editingItemId) {
                await updateDoc(doc(db, "menu_items", editingItemId), itemData);
            } else {
                await addDoc(collection(db, "menu_items"), itemData);
            }
            setIsAddingItem(false);
            setEditingItemId(null);
            setNewItem({ name: "", description: "", price: "", category: "Coffee", image_url: "/assets/images/objects/bean-final.webp" });
        } catch (error) {
            console.error("Error saving document: ", error);
        }
    };

    const handleDeleteItem = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setMenuItems(menuItems.filter(item => item.id !== id));
            return;
        }

        try {
            await deleteDoc(doc(db, "menu_items", id));
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Failed to delete item.");
        }
    };

    const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
            return;
        }
        try {
            await updateDoc(doc(db, "orders", id), { status: newStatus });
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update status.");
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
                <motion.div whileHover={{ y: -5 }} className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm border border-cb-espresso/10 relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-cb-espresso/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">To-Do Orders</p>
                        <p className="font-serif text-4xl font-bold">{orders.filter((o: any) => o.status !== "Completed").length}</p>
                    </div>
                    <DollarSign className="w-10 h-10 opacity-20 relative z-10" />
                </motion.div>
                <motion.div whileHover={{ y: -5 }} id="reservations" className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm border border-cb-espresso/10 relative overflow-hidden group hover:shadow-xl transition-all scroll-mt-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-cb-espresso/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">Upcoming Reservations</p>
                        <p className="font-serif text-4xl font-bold">{reservations.length}</p>
                    </div>
                    <Calendar className="w-10 h-10 opacity-20 relative z-10" />
                </motion.div>
                <motion.div whileHover={{ y: -5 }} id="menu" className="glass p-6 rounded-2xl flex items-center justify-between shadow-sm border border-cb-espresso/10 relative overflow-hidden group hover:shadow-xl transition-all scroll-mt-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-cb-espresso/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">Total Menu Items</p>
                        <p className="font-serif text-4xl font-bold">{menuItems.length}</p>
                    </div>
                    <Coffee className="w-10 h-10 opacity-20 relative z-10" />
                </motion.div>
            </div>

            {/* Business Intelligence Graph */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-cb-espresso/10 shadow-sm w-full">
                <div className="flex justify-between items-end mb-8 border-b border-cb-espresso/10 pb-4">
                    <div>
                        <h3 className="font-serif text-3xl font-bold flex items-center gap-3"><TrendingUp className="w-6 h-6 opacity-70" /> Revenue Stream</h3>
                        <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mt-1">Past 7 Days (Mocked)</p>
                    </div>
                    <h4 className="font-serif font-bold text-4xl text-green-700/80">$5,020</h4>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#382B23" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#382B23" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(56, 43, 35, 0.1)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(56, 43, 35, 0.6)', fontSize: 12, fontFamily: 'serif' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'rgba(56, 43, 35, 0.6)', fontSize: 12, fontFamily: 'serif' }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#FCF8F3', borderRadius: '12px', border: '1px solid rgba(56, 43, 35, 0.1)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#382B23', fontWeight: 'bold' }}
                                labelStyle={{ color: 'rgba(56, 43, 35, 0.6)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#382B23"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Orders Command Center */}
                <div id="orders" className="flex flex-col gap-6 lg:col-span-1 scroll-mt-24">
                    <h3 className="font-serif text-3xl font-bold border-b border-cb-espresso/10 pb-4">Live Orders</h3>
                    <div className="space-y-4">
                        {orders.filter((o: any) => o.status !== "Completed").map((order: any) => (
                            <div key={order.id} className="p-4 rounded-xl border border-cb-espresso/10 bg-white shadow-sm flex flex-col gap-4 items-start justify-between">
                                <div className="w-full break-words">
                                    <p className="font-sans text-xs tracking-widest uppercase opacity-60 font-bold mb-1">Order #{order.id.substring(0, 6)}</p>
                                    <p className="font-serif font-bold text-lg">{order.customerName}</p>
                                    <p className="font-sans text-xs sm:text-sm opacity-80 line-clamp-1">{order.customerEmail}</p>
                                </div>
                                <div className="flex items-center justify-between gap-2 w-full pt-2 border-t border-cb-espresso/5">
                                    <div className="font-sans text-sm font-bold bg-cb-espresso/5 px-3 py-1.5 rounded-full">
                                        ${order.amountTotal?.toFixed(2) || '0.00'}
                                    </div>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-full font-sans tracking-widest uppercase text-[10px] font-bold outline-none border border-transparent hover:border-cb-espresso/20 transition-all cursor-pointer ${order.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                            order.status === "Brewing" ? "bg-blue-100 text-blue-800" :
                                                "bg-green-100 text-green-800"
                                            }`}
                                    >
                                        <option value="Pending">Received</option>
                                        <option value="Brewing">Brewing</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Completed">Complete</option>
                                    </select>
                                </div>
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
                            onClick={() => {
                                setEditingItemId(null);
                                setNewItem({ name: "", description: "", price: "", category: "Coffee", image_url: "/assets/images/objects/bean-final.webp" });
                                setIsAddingItem(true);
                            }}
                            className="bg-cb-espresso text-cb-cream p-2 rounded-full hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {menuItems.map(item => (
                            <div key={item.id} className="glass p-4 rounded-xl flex items-center justify-between transition-all hover:bg-white/60">
                                <div className="flex flex-col">
                                    <span className="font-serif font-bold text-lg">{item.name}</span>
                                    <span className="font-sans text-[10px] tracking-widest uppercase opacity-50">{item.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAvailability(item.id, item.is_available)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-[10px] tracking-widest uppercase font-bold transition-colors ${item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {item.is_available ? <><CheckCircle className="w-3 h-3 hidden sm:block" /> Instock</> : <><XCircle className="w-3 h-3 hidden sm:block" /> Sold Out</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItemId(item.id);
                                            setNewItem({
                                                name: item.name,
                                                description: item.description,
                                                price: item.price.toString(),
                                                category: item.category || "Coffee",
                                                image_url: item.image_url || ""
                                            });
                                            setIsAddingItem(true);
                                        }}
                                        className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteItem(item.id, item.name)}
                                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
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
                            <h3 className="font-serif text-2xl font-bold text-cb-espresso">
                                {editingItemId ? "Edit Item" : "New Creation"}
                            </h3>
                            <button onClick={() => {
                                setIsAddingItem(false);
                                setEditingItemId(null);
                            }} className="text-cb-espresso/50 hover:text-cb-espresso">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveItem} className="p-6 flex flex-col gap-4">
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
                                    <input
                                        required
                                        type="text"
                                        list="category-suggestions"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="w-full bg-white/50 border border-cb-espresso/20 rounded-lg p-3 outline-none focus:border-cb-espresso transition-colors font-sans text-sm"
                                        placeholder="e.g. Coffee, Pastry, Cold Brew"
                                    />
                                    <datalist id="category-suggestions">
                                        {Array.from(new Set(menuItems.map(item => item.category))).map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
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
                                {editingItemId ? "Save Changes" : "Craft Item"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
