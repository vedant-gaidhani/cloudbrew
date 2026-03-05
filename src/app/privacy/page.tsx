export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-cb-cream flex flex-col items-center justify-center p-8 pt-32">
            <div className="max-w-3xl w-full glass p-12 rounded-3xl">
                <h1 className="font-serif text-5xl font-bold text-cb-espresso mb-8">Privacy Policy</h1>

                <div className="font-sans text-cb-espresso/80 space-y-6 leading-relaxed">
                    <p>Last updated: March 2026</p>

                    <h2 className="font-serif text-2xl font-bold text-cb-espresso mt-8">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when making a reservation or placing an order, including your name, email address, and phone number. Payment information is securely processed by our third-party payment processor (Stripe) and is not stored on our servers.</p>

                    <h2 className="font-serif text-2xl font-bold text-cb-espresso mt-8">2. How We Use Your Information</h2>
                    <p>We use the information we collect to fulfill your orders, manage your reservations, and communicate with you about your experience at Cloudbrew.</p>

                    <h2 className="font-serif text-2xl font-bold text-cb-espresso mt-8">3. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us securely at legal@cloudbrew.com.</p>
                </div>
            </div>
        </div>
    );
}
