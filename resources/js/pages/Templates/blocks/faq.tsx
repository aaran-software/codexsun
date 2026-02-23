import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

type FaqItem = {
    value: string;
    question: string;
    answer: string;
};

const faqItems: FaqItem[] = [
    {
        value: 'item-1',
        question:
            'What is the difference between our service and traditional recruitment agencies?',
        answer: 'Unlike traditional recruitment agencies that charge high fees and work on commission, our platform provides direct access to pre-vetted talent with transparent pricing. We focus on quality matches rather than quantity, and our AI-powered matching system ensures candidates meet your specific requirements.',
    },
    {
        value: 'item-2',
        question: 'Is there a minimum contract duration?',
        answer: 'No! Our service has no minimum commitment. You can stop using our platform at any time with no penalties or hidden fees. We believe in earning your business through consistent quality rather than locking you into contracts.',
    },
    {
        value: 'item-3',
        question: 'How much does it cost?',
        answer: 'Our pricing is transparent and based on your specific needs. We offer flexible plans starting from $299/month for startups, with custom enterprise solutions also available. All plans include unlimited job postings and our AI matching technology. Contact us for a personalized quote.',
    },
    {
        value: 'item-4',
        question: 'Do recruiters handle multiple positions simultaneously?',
        answer: 'Yes, our recruiters are trained to efficiently manage multiple positions. However, we carefully balance workloads to ensure each position receives dedicated attention. Each recruiter specializes in specific industries, allowing them to provide expert service across multiple similar roles.',
    },
    {
        value: 'item-5',
        question: 'Do your recruiters work on-site with clients?',
        answer: "We offer both remote and on-site options. Our recruiters can work remotely with your team through our platform, or for enterprise clients, we can arrange on-site visits when needed. This flexibility allows us to adapt to your company's workflow and culture.",
    },
    {
        value: 'item-6',
        question: 'What types of positions can your team help with?',
        answer: 'Our team specializes in technical, creative, and management roles across various industries. We excel at filling positions in software development, design, product management, marketing, and executive leadership. Our platform is constantly expanding to cover new industries and specializations.',
    },
];

const FaqBlock1 = () => {
    return (
        <div className="w-full px-8 py-16">
            <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold">
                        Frequently asked questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about our different
                        services.
                    </p>
                </div>

                <Accordion type="multiple" className="space-y-4">
                    {faqItems.map((item) => (
                        <AccordionItem
                            key={item.value}
                            value={item.value}
                            className="rounded-md !border"
                        >
                            <AccordionTrigger className="cursor-pointer px-4">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-4 text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default FaqBlock1;
