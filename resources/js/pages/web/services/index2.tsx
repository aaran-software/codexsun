import { Head } from '@inertiajs/react';
import FooterCard from '@/components/blocks/footers/FooterCard';
import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import WebLayout from '@/layouts/web-layout';
import CtaSection from '@/pages/web/home/blocks/cta/cta';

export default function Services() {
    return (
        <WebLayout>
            <Head title="Manufacturing" />

            <MenuBackdrop
                image="/assets/techmedia/services-hero.jpg"
                title="IT Services & Solutions"
                subtitle="Reliable technology solutions that support, secure, and scale your business"
            />

            {/* Intro */}
            <section className="px-4 py-16 md:px-[10%]">
                <div className="container max-w-4xl">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        At <strong>Tech Media</strong>, we deliver comprehensive
                        IT services and technology solutions designed to
                        support, secure, and scale your business. Our focus is
                        on reliability, performance, and long-term value—so your
                        technology works for you, not against you.
                    </p>
                </div>
            </section>

            {/* IT Infrastructure */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            💻 IT Infrastructure & Hardware Solutions
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>
                                • Desktop & Laptop sales, installation, and
                                upgrades
                            </li>
                            <li>• Servers, storage, and workstation setup</li>
                            <li>• Printer, scanner, and peripheral support</li>
                            <li>• Annual Maintenance Contracts (AMC)</li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0"
                        alt="IT hardware and infrastructure setup"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            {/* Networking & Security */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
                        alt="Network and cybersecurity solutions"
                        className="rounded-lg shadow-lg"
                    />
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            🖧 Networking & Security
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>• Office LAN / WAN networking</li>
                            <li>• Wi-Fi setup and optimization</li>
                            <li>
                                • Firewall, antivirus, and endpoint security
                            </li>
                            <li>
                                • Data backup and disaster recovery solutions
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Business Software */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            🧠 Business Software & ERP Solutions
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>• ERP & CRM implementation</li>
                            <li>• Accounting & inventory software support</li>
                            <li>
                                • Customization, integration, and user training
                            </li>
                            <li>• Software upgrades and performance tuning</li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
                        alt="Business software and ERP systems"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            {/* Cloud & Server */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa"
                        alt="Cloud and server solutions"
                        className="rounded-lg shadow-lg"
                    />
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            ☁️ Cloud & Server Solutions
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>• On-premise and cloud server setup</li>
                            <li>• Email hosting & domain management</li>
                            <li>• Cloud backup and migration support</li>
                            <li>• Remote access and collaboration tools</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* IT Support */}
            <section className="bg-muted/30 px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            🔧 IT Support & Managed Services
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>• On-call and remote technical support</li>
                            <li>• System health monitoring</li>
                            <li>• OS installation and patch management</li>
                            <li>
                                • Troubleshooting and performance optimization
                            </li>
                        </ul>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789"
                        alt="IT support and managed services team"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </section>

            {/* Consulting */}
            <section className="px-4 py-20 md:px-[10%]">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:flex-row-reverse">
                    <img
                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                        alt="IT consulting and digital transformation"
                        className="rounded-lg shadow-lg"
                    />
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">
                            🏢 IT Consulting & Digital Enablement
                        </h2>
                        <ul className="space-y-3 text-lg text-muted-foreground">
                            <li>• Technology planning and IT audits</li>
                            <li>
                                • Hardware & software procurement consulting
                            </li>
                            <li>
                                • Cost optimization and scalability planning
                            </li>
                            <li>
                                • Process automation and workflow improvement
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <CtaSection />
            <FooterCard />
        </WebLayout>
    );
}
