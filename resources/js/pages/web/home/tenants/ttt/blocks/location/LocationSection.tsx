import { Link } from "@inertiajs/react";
import FadeUp from '@/components/animate/fade-up';

export default function LocationSection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT CONTENT */}
                    <FadeUp>
                        <div>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                Our Location
                            </h2>

                            <p className="text-gray-700 leading-relaxed mb-6">
                                <strong className="text-2xl">The Tirupur Textiles</strong><br />
                                No. 55 / Old No: 45, Thillai Mestry Street,<br />
                                Near Old Bus Stand & Railway Station,<br />
                                Puducherry – 605001
                            </p>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <p>Monday – Friday: 9:00 AM – 8:00 PM</p>
                                <p>Saturday: 9:00 AM – 8:00 PM</p>
                                <p>Sunday: 10:00 AM – 3:00 PM</p>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-8">
                                <p>Phone: +91 96555 11778</p>
                                <p>Email: info@thetirupurtextiles.com</p>
                            </div>

                            <Link
                                href="/contact"
                                className="inline-block bg-black text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition"
                            >
                                CONTACT US
                            </Link>
                        </div>
                    </FadeUp>

                    {/* RIGHT VISUAL */}
                    <FadeUp>
                        <div className="relative">

                            {/* Main Image */}
                            <img
                                src="/assets/ttt/shop.jpeg"
                                alt="Showroom"
                                className="w-full h-130 object-cover"
                                loading="lazy"
                            />

                            {/* Map Overlay */}
                            <div className="absolute -bottom-12 left-8 bg-white shadow-xl p-2 w-96 h-56">
                                <iframe
                                    title="The Tirupur Textiles Location"
                                    src="https://www.google.com/maps?q=The+Tirupur+Textiles,+Puducherry&output=embed"
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                            </div>

                        </div>
                    </FadeUp>

                </div>
            </div>
        </section>
    );
}
