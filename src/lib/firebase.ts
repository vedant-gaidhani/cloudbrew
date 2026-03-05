// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Types
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    is_popular: boolean;
    is_available: boolean;
}

// Utility to fetch menu items
export const fetchMenuItems = async (): Promise<MenuItem[]> => {
    // If we're using mock credentials, return mock data so the UI still works
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        return [
            {
                id: "1",
                name: "Cloud Macchiato",
                description: "Ethereal foam • Artisanal beans",
                price: 8.50,
                image_url: "/assets/images/objects/bean-final.webp",
                category: "Coffee",
                is_popular: true,
                is_available: true
            },
            {
                id: "2",
                name: "Lavender Latte",
                description: "Sweet floral notes • Steamed milk",
                price: 7.00,
                image_url: "/assets/images/objects/macaron-final.webp",
                category: "Coffee",
                is_popular: true,
                is_available: true
            },
            {
                id: "3",
                name: "Velvet Matcha",
                description: "Ceremonial grade • Creamy finish",
                price: 9.00,
                image_url: "/assets/images/objects/sugar-final.webp",
                category: "Tea",
                is_popular: false,
                is_available: true
            },
            {
                id: "4",
                name: "Dream Brew",
                description: "Cold steeped • Nitrogen infused",
                price: 6.50,
                image_url: "/assets/images/objects/bean-final.webp",
                category: "Coffee",
                is_popular: false,
                is_available: true
            }
        ];
    }

    try {
        const menuRef = collection(db, "menu_items");
        // Only fetch available items for the frontend
        const q = query(menuRef, where("is_available", "==", true));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MenuItem[];
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
};

export { app, db, auth };
