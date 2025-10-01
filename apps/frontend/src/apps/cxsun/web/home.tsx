import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart2, Users, Package, Settings } from "lucide-react";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary/5 to-background">
                <div className="py-12 sm:py-20">
                <div className="mx-auto px-4 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        Codexsun ERP Software
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Streamline your business with our all-in-one ERP solution. Manage operations,
                        boost productivity, and drive growth with ease.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors focus:outline-none"
                    >
                        Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-10">Why Choose Codexsun ERP?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <BarChart2 className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
                            <p className="text-muted-foreground">
                                Gain real-time insights with powerful analytics to make data-driven decisions.
                            </p>
                        </div>
                        <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <Users className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Team Management</h3>
                            <p className="text-muted-foreground">
                                Simplify HR processes and manage your workforce efficiently.
                            </p>
                        </div>
                        <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <Package className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Inventory Control</h3>
                            <p className="text-muted-foreground">
                                Optimize inventory with real-time tracking and automated workflows.
                            </p>
                        </div>
                        <div className="p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <Settings className="h-10 w-10 text-primary mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Customizable  Workflows</h3>
                            <p className="text-muted-foreground">
                                Tailor processes to fit your business needs with flexible tools.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 bg-primary/5">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join thousands of businesses using Codexsun  asf ERP to streamline operations and
                        achieve their goals.
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors focus:outline-none"
                    >
                        Log In Now <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                </div>
            </section>

        </div>
    );
}