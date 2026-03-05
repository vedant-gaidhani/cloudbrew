"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Calendar, Clock, User, Phone, Edit3 } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function ReservationForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { reservations, setReservations } = useStore();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Write to Firestore Reservations Collection
            let docId = "mock-id-" + Math.random().toString(36).substring(7);
            if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
                const docRef = await addDoc(collection(db, "reservations"), {
                    ...formData,
                    createdAt: new Date(),
                    status: "confirmed"
                });
                docId = docRef.id;
            } else {
                // Pipe to Zustand mock state
                setReservations([...reservations, { id: docId, ...formData, guests: Number(formData.guests), status: "confirmed" }]);
            }

            // 2. Send Confirmation Email via API Route
            await fetch("/api/send-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, reservationId: docId }),
            });

            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", date: "", time: "", guests: "2" });

            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Error making reservation:", error);
            alert("Failed to make reservation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-3xl w-full max-w-2xl mx-auto border border-cb-espresso/10 relative overflow-hidden">
            {success && (
                <div className="absolute inset-0 bg-cb-cream/95 backdrop-blur-md z-10 flex flex-col items-center justify-center text-cb-espresso animate-in fade-in duration-500">
                    <Edit3 className="w-16 h-16 mb-4 text-green-500" />
                    <h3 className="font-serif text-3xl font-bold mb-2">Table Secured</h3>
                    <p className="font-sans text-sm tracking-widest uppercase opacity-80">A confirmation email is flying to you.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Name</label>
                        <div className="flex items-center border-b border-cb-espresso/30 py-2">
                            <User className="w-4 h-4 mr-3 opacity-50" />
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-xl" placeholder="Your Name" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Email</label>
                        <div className="flex items-center border-b border-cb-espresso/30 py-2">
                            <Edit3 className="w-4 h-4 mr-3 opacity-50" />
                            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-xl" placeholder="hello@example.com" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Phone</label>
                    <div className="flex items-center border-b border-cb-espresso/30 py-2">
                        <Phone className="w-4 h-4 mr-3 opacity-50" />
                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-xl" placeholder="+1 (555) 000-0000" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Date</label>
                        <div className="flex items-center border-b border-cb-espresso/30 py-2">
                            <Calendar className="w-4 h-4 mr-3 opacity-50" />
                            <input required type="date" name="date" value={formData.date} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-lg" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Time</label>
                        <div className="flex items-center border-b border-cb-espresso/30 py-2">
                            <Clock className="w-4 h-4 mr-3 opacity-50" />
                            <input required type="time" name="time" min="08:00" max="22:00" value={formData.time} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-lg" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="font-sans text-xs tracking-widest uppercase font-bold opacity-70">Guests</label>
                        <div className="flex items-center border-b border-cb-espresso/30 py-2">
                            <User className="w-4 h-4 mr-3 opacity-50" />
                            <select name="guests" value={formData.guests} onChange={handleChange} className="bg-transparent w-full outline-none font-serif text-lg cursor-pointer">
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num} className="bg-cb-cream text-cb-espresso">{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full bg-cb-espresso text-cb-cream py-4 rounded-full font-sans tracking-widest uppercase font-bold hover:bg-cb-espresso/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-cb-cream/30 border-t-cb-cream rounded-full animate-spin"></div>
                    ) : "Confirm Reservation"}
                </button>
            </form>
        </div>
    );
}
