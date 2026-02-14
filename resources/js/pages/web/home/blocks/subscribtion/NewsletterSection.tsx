import FadeUp from '@/components/animate/fade-up';

export default function NewsletterSection() {
    return (
        <section className="relative bg-[#F9D75C] py-12 overflow-hidden">

            {/* Top Visual Band */}
            <div className="relative flex justify-center mb-16">
                <img
                    src="/assets/ttt/bags.png"
                    alt="Shopping Bags"
                    className="w-56 opacity-90"
                    loading="lazy"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <FadeUp>
                    <div className="max-w-3xl mx-auto text-center">

                        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                            Sign up for a newsletter
                        </h2>

                        <p className="text-sm text-gray-800 mb-14 leading-relaxed">
                            Get updates on new arrivals, wholesale offers,
                            Tirupur manufacturing insights, and bulk order
                            opportunities.
                        </p>

                        {/* Form */}
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="text-left">
                                <label className="text-xs text-gray-800">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-b border-gray-900 focus:outline-none py-2"
                                />
                            </div>

                            <div className="text-left">
                                <label className="text-xs text-gray-800">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-transparent border-b border-gray-900 focus:outline-none py-2"
                                />
                            </div>
                        </form>

                        <button
                            type="submit"
                            className="inline-block bg-black cursor-pointer text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-[#e63c64] transition"
                        >
                            Sign up today
                        </button>

                        {/* Trust Note */}
                        <p className="text-xs text-gray-700 mt-6">
                            We respect your privacy. No spam. Only business updates.
                        </p>

                    </div>
                </FadeUp>
            </div>
        </section>
    );
}
