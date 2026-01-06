import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('hardware');

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // simulate API call
        setTimeout(() => {
            console.log({
                name,
                email,
                type,
                message,
            });

            setLoading(false);
            setSubmitted(true);

            // reset form
            setName('');
            setEmail('');
            setMessage('');
            setType('hardware');

            // hide success message after 5 seconds
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="type">Inquiry Type</Label>
                <Select
                    value={type}
                    onValueChange={setType}
                    disabled={loading}
                >
                    <SelectTrigger id="type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="hardware">Hardware Sales</SelectItem>
                        <SelectItem value="repair">Computer Repair</SelectItem>
                        <SelectItem value="custom-build">Custom PC Build</SelectItem>
                        <SelectItem value="consultation">
                            Hardware Consultation
                        </SelectItem>
                        <SelectItem value="software">
                            Software Development
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your needs..."
                    rows={6}
                    required
                    disabled={loading}
                />
            </div>

            {submitted && (
                <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
                    Thank you for your message! We'll get back to you soon.
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    'Send Message'
                )}
            </Button>
        </form>
    );
}
