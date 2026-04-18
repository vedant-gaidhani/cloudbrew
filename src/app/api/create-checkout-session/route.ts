import { NextResponse } from "next/server";
import Stripe from "stripe";

// Check if Stripe key is available, else mock
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_mockKey";
const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-02-24.acacia" as any, // TypeScript workaround for changing API version enums
    appInfo: {
        name: "Cloudbrew E-Commerce",
    }
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, orderId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "No items in checkout" },
                { status: 400 }
            );
        }

        // Mock Stripe Checkout if no real key is present
        if (stripeKey === "sk_test_mockKey") {
            // We'll mock the URL so the UI flow doesn't break
            console.warn("Using mock Stripe credentials. Redirecting to mock success.");
            return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id=mock_session_id&order_id=${orderId || 'mock_order_id'}` });
        }

        // Map Zustand Cart Items directly to Stripe Line Items
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    description: item.description || `Cloudbrew ${item.name}`,
                    images: item.image_url ? [`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${item.image_url}`] : [],
                },
                unit_amount: item.price * 100, // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}${orderId ? `&order_id=${orderId}` : ''}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cancel`,
            metadata: {
                source: "cloudbrew-frontend",
                orderId: orderId || "unknown"
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
