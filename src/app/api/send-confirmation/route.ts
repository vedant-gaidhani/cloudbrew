import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with key or pass mock if not available
const resendKey = process.env.RESEND_API_KEY || "re_mock";
const resend = new Resend(resendKey);

export async function POST(req: Request) {
    try {
        const { name, email, phone, date, time, guests, reservationId } = await req.json();

        // Mock response if API key isn't provided (protects UI flow)
        if (resendKey === "re_mock") {
            console.warn("Using mock Resend credentials. Simulating email success.");
            return NextResponse.json({ success: true, mock: true });
        }

        // Send the actual email
        const data = await resend.emails.send({
            from: 'Cloudbrew Reservations <reservations@cloudbrew.fake>', // Replace with your verified domain
            to: [email],
            subject: `Your Cloudbrew Reservation is Confirmed!`,
            html: `
        <div style="font-family: 'Georgia', serif; color: #4A3728; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="text-align: center; border-bottom: 1px solid #E8DFF5; padding-bottom: 20px;">CLOUD BREW</h1>
          <p>Dear ${name},</p>
          <p>Your journey into the clouds is confirmed. We are thrilled to host you.</p>
          
          <div style="background-color: #F8EDE3; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Reservation Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Date:</strong> ${date}</li>
              <li><strong>Time:</strong> ${time}</li>
              <li><strong>Guests:</strong> ${guests}</li>
              <li><strong>Ref ID:</strong> ${reservationId}</li>
            </ul>
          </div>
          
          <p>If you need to adjust your flight path, please reply to this email or call us at ${phone}.</p>
          <p style="text-align: center; margin-top: 40px; font-style: italic;">Stay surreal.</p>
        </div>
      `,
        });

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Resend Email Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
