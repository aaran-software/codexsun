// src/pages/ComponentsPage.tsx
import {JSX, useState} from 'react';
import AccordionDemo from "./accordion";
import ButtonDemo from "./ButtonDemo";
import CardDemo from "./CardDemo";
import {Calendar} from "../components/ui/calendar";

type DemoKey = "accordion" | "button" | "card" | "calender" | "testimonials";

const demos: Record<DemoKey, { title: string; component: JSX.Element }> = {
    accordion: {title: "Accordion", component: <AccordionDemo/>},
    button: {title: "Button", component: <ButtonDemo/>},
    card: {title: "Card", component: <CardDemo/>},
    calender: {title: "Calender", component: <Calendar/>},



};

export default function ComponentsPage() {
    const [activeDemo, setActiveDemo] = useState<DemoKey | null>(null);

    return (
        <div className="p-1 space-y-2">
            <h1 className="text-4xl font-bold mb-6">Shadcn UI Components Demo</h1>

            {/* Sidebar Menu */}
            <div className="flex space-x-10">
                <aside className="w-48 border-r pr-4">
                    <ul className="space-y-3">
                        {Object.entries(demos).map(([key, {title}]) => (
                            <li key={key}>
                                <button
                                    onClick={() => setActiveDemo(key as DemoKey)}
                                    className={`w-full text-left p-2 rounded-md ${
                                        activeDemo === key
                                            ? "bg-indigo-600 text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Demo Preview */}
                <main className="flex-1">
                    {activeDemo ? (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">
                                {demos[activeDemo].title}
                            </h2>
                            <div className="p-6 border rounded-lg bg-white shadow-sm">
                                {demos[activeDemo].component}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">👈 Select a component to preview</p>
                    )}
                </main>
            </div>
        </div>
    );
}
