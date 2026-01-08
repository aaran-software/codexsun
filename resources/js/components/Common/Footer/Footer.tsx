import { SiFacebook, SiX, SiLinkedin, SiInstagram } from 'react-icons/si';

interface FooterProps {
    companyName: string;
}

export default function Footer({ companyName }: FooterProps) {
    return (
        <footer className="border-t border-border/40 bg-muted/30">
            <div className="container py-12">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/assets/techmedia/logo.svg"
                                alt={`${companyName} Logo`}
                                className="h-8 w-8"
                            />
                            <span className="text-xl font-bold text-primary">{companyName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Innovative software solutions and high-quality hardware products.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/public" className="text-muted-foreground transition-colors hover:text-primary">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/services" className="text-muted-foreground transition-colors hover:text-primary">
                                    Services
                                </a>
                            </li>
                            <li>
                                <a href="/portfolio" className="text-muted-foreground transition-colors hover:text-primary">
                                    Portfolio
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Services</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="text-muted-foreground">Software Development</li>
                            <li className="text-muted-foreground">IT Support</li>
                            <li className="text-muted-foreground">CCTV Installation</li>
                            <li className="text-muted-foreground">Hardware Sales</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Contact</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>123 Technology Road</li>
                            <li>Tech City</li>
                            <li>+1234567890</li>
                            <li>info@techmedia.com</li>
                        </ul>
                        <div className="mt-4 flex space-x-3">
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <SiFacebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <SiX className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <SiLinkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-muted-foreground transition-colors hover:text-primary">
                                <SiInstagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
                    <p>
                        © 2025. Developed by
                        <a
                            href="https://techmedia.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Techmedia
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
