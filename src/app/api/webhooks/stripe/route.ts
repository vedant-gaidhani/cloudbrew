import { NextResponse } from "next/server";
import Stripe from "stripe";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Only once)
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (error) {
            console.error("Firebase Admin Init Error:", error);
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing. Webhooks to Firestore will fail or mock.");
    }
}

const db = admin.apps.length ? admin.firestore() : null;

// Initialize Stripe securely
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mockKey";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock";
const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-02-24.acacia" as any,
    appInfo: { name: "Cloudbrew Secure Checkout" }
});

export async function POST(req: Request) {
    try {
        const payload = await req.text(); // Get raw body as text for Stripe Signature checking
        const signature = req.headers.get("stripe-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
        }

        let event: Stripe.Event;

        try {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            console.error("Webhook signature verification failed.", err.message);
            return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
        }

        // Handle successful checkout
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract customer details safely
            const customerEmail = session.customer_details?.email || "No Email Provided";
            const customerName = session.customer_details?.name || "Cloudbrew Guest";

            // Securely write to firestore via admin sdk that ignores client-side security rules
            if (db) {
                await db.collection("orders").doc(session.id).set({
                    stripeSessionId: session.id,
                    customerName,
                    customerEmail,
                    amountTotal: session.amount_total ? session.amount_total / 100 : 0, // Convert cents to dollars
                    status: "Pending", // Set initial real-time status
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                console.log(`Order ${session.id} successfully secured in Firestore.`);
            } else {
                console.warn(`Firestore Admin DB missing. Order ${session.id} simulated.`);
            }
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error: any) {
        console.error("Webhook processing error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
