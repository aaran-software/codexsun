// resources/js/pages/web/custom/CustomPcBuilder.tsx

'use client';

import { Head } from '@inertiajs/react';
import {
    Cpu,
    HardDrive,
    MemoryStick,
    Power,
    Fan,
    Trash2,
    ShoppingCart,
    RotateCcw,
    AlertTriangle,
    Wrench,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import MenuBackdrop from '@/components/blocks/menu/menu-backdrop';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WebLayout from '@/layouts/web-layout';
import type { CustomPcData } from '@/lib/tenant/custom-pc.types';

interface PcComponent {
    id: number;
    name: string;
    price: number;
    category: string;
    socket?: string;
    ram_type?: string;
    form_factor?: string;
    tdp?: number;
    wattage?: number;
    supportedSockets?: string[];
    supportedFormFactors?: string[];
    image?: string;
}

interface BuildState {
    cpu: PcComponent | null;
    motherboard: PcComponent | null;
    ram: PcComponent[];
    gpu: PcComponent | null;
    storage: PcComponent[];
    psu: PcComponent | null;
    case: PcComponent | null;
    cooler: PcComponent | null;
}

interface Props {
    customPc: CustomPcData;
}

export default function CustomPcBuilder({ customPc }: Props) {
    const [activeCategory, setActiveCategory] =
        useState<keyof BuildState>('cpu');

    const [build, setBuild] = useState<BuildState>({
        cpu: null,
        motherboard: null,
        ram: [],
        gpu: null,
        storage: [],
        psu: null,
        case: null,
        cooler: null,
    });

    const [issues, setIssues] = useState<string[]>([]);

    const currentProducts: PcComponent[] =
        customPc?.components?.[activeCategory] || [];

    const { totalPrice, computedIssues } = useMemo(() => {
        let price = 0;
        const newIssues: string[] = [];

        if (build.cpu) price += build.cpu.price || 0;

        if (build.motherboard && build.cpu) {
            if (
                !build.motherboard.supportedSockets?.includes(
                    build.cpu.socket || '',
                )
            ) {
                newIssues.push(
                    `CPU socket (${build.cpu.socket}) not supported by motherboard`,
                );
            }
            price += build.motherboard.price || 0;
        }

        build.ram.forEach((item) => (price += item.price || 0));
        if (build.ram.length > 0 && build.motherboard) {
            const ramType = build.ram[0]?.ram_type;
            if (ramType && build.motherboard.ram_type !== ramType) {
                newIssues.push(
                    `RAM type mismatch: Motherboard supports ${build.motherboard.ram_type}`,
                );
            }
        }

        if (build.gpu && build.psu) {
            const required =
                (build.gpu.tdp || 0) + (build.cpu?.tdp || 100) + 200;
            if ((build.psu.wattage || 0) < required) {
                newIssues.push(
                    `PSU may be insufficient (${build.psu.wattage}W). Recommended: ${required}W+`,
                );
            }
        }
        if (build.gpu) price += build.gpu.price || 0;
        if (build.psu) price += build.psu.price || 0;

        if (build.motherboard && build.case) {
            if (
                !build.case.supportedFormFactors?.includes(
                    build.motherboard.form_factor || '',
                )
            ) {
                newIssues.push(
                    `Case does not support ${build.motherboard.form_factor} motherboard`,
                );
            }
        }
        if (build.case) price += build.case.price || 0;

        if (build.cpu && build.cooler) {
            if (
                !build.cooler.supportedSockets?.includes(build.cpu.socket || '')
            ) {
                newIssues.push(
                    `Cooler does not support CPU socket (${build.cpu.socket})`,
                );
            }
        }
        if (build.cooler) price += build.cooler.price || 0;

        build.storage.forEach((item) => (price += item.price || 0));

        return { totalPrice: price, computedIssues: newIssues };
    }, [build]);

    const addComponent = (category: keyof BuildState, product: PcComponent) => {
        setBuild((prev) => {
            if (['ram', 'storage'].includes(category)) {
                return {
                    ...prev,
                    [category]: [...(prev[category] as PcComponent[]), product],
                };
            }
            return { ...prev, [category]: product };
        });
    };

    const removeComponent = (category: keyof BuildState, index?: number) => {
        setBuild((prev) => {
            if (index !== undefined && Array.isArray(prev[category])) {
                const updated = [...(prev[category] as PcComponent[])];
                updated.splice(index, 1);
                return { ...prev, [category]: updated };
            }
            return { ...prev, [category]: null };
        });
    };

    const resetBuild = () => {
        setBuild({
            cpu: null,
            motherboard: null,
            ram: [],
            gpu: null,
            storage: [],
            psu: null,
            case: null,
            cooler: null,
        });
    };

    return (
        <WebLayout>
            <Head title="Custom PC Builder - Tech Media Retail" />

            <MenuBackdrop
                image="/assets/techmedia/repair.jpg"
                title="Custom PC"
                subtitle="Build your dream machine"
            />

            <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
                {/* Sticky Header */}
                <div className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md">
                    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Custom PC Builder
                        </h1>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    ₹{totalPrice.toLocaleString('en-IN')}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetBuild}
                                className="gap-2"
                            >
                                <RotateCcw size={18} /> Reset
                            </Button>

                            <Button
                                size="sm"
                                className="gap-2"
                                disabled={totalPrice === 0}
                            >
                                <ShoppingCart size={18} /> Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-10">
                    <div className="grid gap-10 lg:grid-cols-12">
                        {/* Sidebar */}
                        <div className="lg:col-span-3">
                            <div className="sticky top-24 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Components</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1">
                                        {Object.keys(
                                            customPc?.components || {},
                                        ).map((cat) => (
                                            <Button
                                                key={cat}
                                                variant={
                                                    activeCategory === cat
                                                        ? 'default'
                                                        : 'ghost'
                                                }
                                                className="w-full justify-start text-left capitalize"
                                                onClick={() =>
                                                    setActiveCategory(
                                                        cat as keyof BuildState,
                                                    )
                                                }
                                            >
                                                {cat}
                                            </Button>
                                        ))}
                                    </CardContent>
                                </Card>

                                {computedIssues.length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-5 w-5" />
                                        <AlertTitle>
                                            Compatibility Issues
                                        </AlertTitle>
                                        <AlertDescription className="mt-2 space-y-1">
                                            {computedIssues.map((issue, i) => (
                                                <div key={i}>• {issue}</div>
                                            ))}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        {/* Main Area */}
                        <div className="lg:col-span-9">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Current Build</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.entries(build).map(
                                        ([key, value]) => {
                                            if (!value) return null;

                                            if (Array.isArray(value)) {
                                                return value.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={`${key}-${idx}`}
                                                            className="flex items-center justify-between border-b py-4 last:border-0"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-zinc-100">
                                                                    <img
                                                                        src={
                                                                            item.image ||
                                                                            'https://picsum.photos/seed/component/100/100'
                                                                        }
                                                                        alt={
                                                                            item.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                        loading="lazy"
                                                                        onError={(
                                                                            e,
                                                                        ) => {
                                                                            (
                                                                                e.target as HTMLImageElement
                                                                            ).src =
                                                                                'https://picsum.photos/seed/component/100/100';
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <div className="font-medium capitalize">
                                                                        {key}
                                                                    </div>
                                                                    <div className="line-clamp-1 text-sm text-gray-600">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6">
                                                                <span className="font-semibold text-emerald-600">
                                                                    ₹
                                                                    {item.price.toLocaleString(
                                                                        'en-IN',
                                                                    )}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        removeComponent(
                                                                            key as keyof BuildState,
                                                                            idx,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ),
                                                );
                                            }

                                            return (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between border-b py-4 last:border-0"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-zinc-100">
                                                            <img
                                                                src={
                                                                    (
                                                                        value as PcComponent
                                                                    ).image ||
                                                                    'https://picsum.photos/seed/component/100/100'
                                                                }
                                                                alt={
                                                                    (
                                                                        value as PcComponent
                                                                    ).name
                                                                }
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    (
                                                                        e.target as HTMLImageElement
                                                                    ).src =
                                                                        'https://picsum.photos/seed/component/100/100';
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="font-medium capitalize">
                                                                {key}
                                                            </div>
                                                            <div className="line-clamp-1 text-sm text-gray-600">
                                                                {
                                                                    (
                                                                        value as PcComponent
                                                                    ).name
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-6">
                                                        <span className="font-semibold text-emerald-600">
                                                            ₹
                                                            {(
                                                                value as PcComponent
                                                            ).price.toLocaleString(
                                                                'en-IN',
                                                            )}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeComponent(
                                                                    key as keyof BuildState,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}

                                    {Object.values(build).every(
                                        (v) =>
                                            !v ||
                                            (Array.isArray(v) &&
                                                v.length === 0),
                                    ) && (
                                        <div className="py-20 text-center text-gray-500">
                                            Start building — select a category
                                            on the left
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Products Grid */}
                            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {currentProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="group overflow-hidden transition-all hover:shadow-xl"
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-zinc-100">
                                            <img
                                                src={
                                                    product.image ||
                                                    'https://picsum.photos/seed/pc/600/400'
                                                }
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        </div>

                                        <CardContent className="p-6">
                                            <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600">
                                                {product.name}
                                            </h3>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-2xl font-bold text-emerald-600">
                                                    ₹
                                                    {product.price.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        addComponent(
                                                            activeCategory,
                                                            product,
                                                        )
                                                    }
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}
