'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919876543210'; // 🔴 change to your number

export default function FloatingWhatsApp() {
    const message =
        'Hi, I am looking for bulk / wholesale knitted garments. Please share details.';

    return (
        <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                message,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed right-6 bottom-6 z-[9999] flex items-center gap-3 rounded-full bg-green-600 px-5 py-4 text-white shadow-2xl transition hover:scale-110 hover:bg-green-700"
        >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden font-semibold sm:block">
                WhatsApp Bulk Enquiry
            </span>
        </a>
    );
}
