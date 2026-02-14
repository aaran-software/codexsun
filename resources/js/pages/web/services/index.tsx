import { Head } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/tenants/default/blocks/cta/cta';

export default function Services() {
    return (
        <WebLayout>
            <Head title="Capabilities | The Tirupur Textiles" />

            {/* Hero */}
            <MenuBackdrop
                image="/assets/techmedia/services-hero.jpg"
                title="Our Manufacturing Capabilities"
                subtitle="Wholesale knitted garment manufacturing from Tirupur"
            />

            {/* Intro */}
            <section className="px-4 py-16 md:px-[10%]">
                <div className="container max-w-4xl">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        At <strong>The Tirupur Textiles</strong>, we specialize
                        in large-scale knitted garment manufacturing for brands,
                        wholesalers, and bulk buyers. Our capabilities are built
                        around consistent quality, reliable timelines, and
                        factory-direct supply.
                    </p>
                </div>
            </section>

            {/* Bulk Manufacturing */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-4 text-3xl font-bold">
                            🧵 Bulk Manufacturing
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            High-volume knitted garment production with stable
                            quality across all lots.
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>• Men’s, Women’s & Kids wear</li>
                            <li>
                                • T-Shirts, polos, track pants & casual wear
                            </li>
                            <li>• Flexible MOQ for repeat buyers</li>
                            <li>• Consistent sizing & stitching</li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1581092919535-7146c8c2b1f9"
                        alt="Bulk garment manufacturing"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            <CtaSection />

            {/* Custom Branding */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1520974735194-6c4b59c8d93b"
                        alt="Custom garment branding"
                        className="rounded-lg shadow-lg"
                    />
                    <div>
                        <h2 className="mb-4 text-3xl font-bold">
                            🏷 Custom Branding (OEM / Private Label)
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Build your brand with our private-label
                            manufacturing support.
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>• Neck labels & wash care labels</li>
                            <li>• Custom sizing & measurements</li>
                            <li>• Brand-specific packaging</li>
                            <li>• Color & style consistency</li>
                        </ul>
                    </div>
                </div>
            </section>

            <CtaSection />

            {/* Fabric & GSM */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-4 text-3xl font-bold">
                            🧶 Fabric & GSM Options
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Premium Tirupur-sourced cotton fabrics for comfort
                            and durability.
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>• 100% Cotton & cotton blends</li>
                            <li>• Single jersey, rib & interlock</li>
                            <li>• GSM options: 160 / 180 / 200 / 220+</li>
                            <li>• Combed & bio-washed fabrics</li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f"
                        alt="Cotton fabric and GSM options"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            <CtaSection />

            {/* Quality Control */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1581090700227-1e37b190418e"
                        alt="Garment quality control"
                        className="rounded-lg shadow-lg"
                    />
                    <div>
                        <h2 className="mb-4 text-3xl font-bold">
                            ✅ Quality Control
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Quality checks at every stage of production to
                            ensure consistent output.
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>• Fabric inspection</li>
                            <li>• In-line production checks</li>
                            <li>• Measurement & stitching accuracy</li>
                            <li>• Final finishing inspection</li>
                        </ul>
                    </div>
                </div>
            </section>

            <CtaSection />

            {/* Logistics */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-4 text-3xl font-bold">
                            🚚 Logistics & Delivery
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            Reliable dispatch and transport coordination for
                            bulk shipments.
                        </p>
                        <ul className="space-y-3 text-muted-foreground">
                            <li>• Direct dispatch from Tirupur</li>
                            <li>• Regular supply to Pondicherry</li>
                            <li>• Secure bulk packaging</li>
                            <li>• Domestic & export-ready support</li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c"
                        alt="Garment logistics and delivery"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            <CtaSection />
            <FooterCard />
        </WebLayout>
    );
}
