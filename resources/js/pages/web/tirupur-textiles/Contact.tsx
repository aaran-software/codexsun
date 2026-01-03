'use client';
import { useState } from 'react';
import "../../../../css/textiles.css"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Header from '@/components/header/header';
import FooterSection from '@/pages/web/home/FooterSection';

export default function Home() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                message: '',
            });
            setTimeout(() => setSubmitStatus('idle'), 5000);
        }, 1500);
    };
    const navItems = [
        { name: 'Home', href: '/tirupur-textiles' },
        { name: 'About', href: '/tirupur-textiles/about' },
        { name: 'Services', href: '/tirupur-textiles/services' },
        { name: 'Blogs', href: '/blog/web/articles' },
        { name: 'Contact', href: '/tirupur-textiles/contact' },
    ];
    return (
        <>
            <Header navItems={navItems} />

            <div className="flex flex-col">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary to-secondary py-16 md:py-24">
                    <div className="container mx-auto px-4 text-center md:px-6">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                            Get In Touch
                        </h1>
                        <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
                            Have a question or ready to start your next project? We'd love to hear from you.
                        </p>
                    </div>
                </section>

                {/* Contact Form & Info Section */}
                <section className="py-16 md:py-24 px-4 md:px-[10%]">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                            {/* Contact Information */}
                            <div className="space-y-6 lg:col-span-1">
                                <div>
                                    <h2 className="mb-6 text-2xl font-bold tracking-tight">Contact Information</h2>
                                    <p className="text-muted-foreground">
                                        Reach out to us through any of the following channels. Our team is ready to assist you.
                                    </p>
                                </div>

                                <Card className="border-border/50">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <MapPin className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Address</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        123 Textile Avenue
                                                        <br />
                                                        Fashion District, NY 10001
                                                        <br />
                                                        United States
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Phone className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Phone</h3>
                                                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                                                    <p className="text-sm text-muted-foreground">+1 (555) 123-4568</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Mail className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Email</h3>
                                                    <p className="text-sm text-muted-foreground">info@texties.com</p>
                                                    <p className="text-sm text-muted-foreground">support@texties.com</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3">
                                                <div className="rounded-lg bg-primary/10 p-2">
                                                    <Clock className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 font-semibold">Business Hours</h3>
                                                    <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                                    <p className="text-sm text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                                                    <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <Card className="border-border/50">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Fill out the form below and we'll get back to you as soon as possible.
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">
                                                        Full Name <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        placeholder="John Doe"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">
                                                        Email Address <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        placeholder="+1 (555) 123-4567"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Company Name</Label>
                                                    <Input
                                                        id="company"
                                                        name="company"
                                                        placeholder="Your Company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">
                                                    Message <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    placeholder="Tell us about your project or inquiry..."
                                                    rows={6}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>

                                            {submitStatus === 'success' && (
                                                <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
                                                    Thank you for your message! We'll get back to you soon.
                                                </div>
                                            )}

                                            {submitStatus === 'error' && (
                                                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                                                    Something went wrong. Please try again later.
                                                </div>
                                            )}

                                            <Button type="submit" size="lg" className="gradient-primary w-full" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    'Sending...'
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="ml-2 h-5 w-5" />
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                                <div className="overflow-hidden mt-10 rounded-lg border border-border/50 ">
                                    <div className="w-full h-full bg-muted">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9476519598093!2d-73.99185368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                                            width="100%"
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title="Office Location"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Map Section */}
            </div>

            {/* Footer */}
            <FooterSection />
        </>
    );
}
