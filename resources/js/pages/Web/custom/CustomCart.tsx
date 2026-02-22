// resources/js/pages/web/cart/Cart.tsx

'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import WebLayout from '@/layouts/web-layout';
import type { CartData } from '@/lib/tenant/custom-pc.types';

interface CartPageProps {
    cart?: CartData | null;
}
export default function Cart({ cart }: CartPageProps) {

    if (!cart) return null;

    const {
        heading,
        continueShoppingText,
        continueShoppingHref,
        subtotalLabel,
        shippingLabel,
        shippingValue,
        totalLabel,
        proceedToCheckoutText,
        items,
    } = cart;

    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const shipping = 0; // free for now
    const total = subtotal + shipping;

    // Placeholder handlers (connect to real cart update later)
    const updateQuantity = (id: number, delta: number) => {
        console.log(`Update ${id} by ${delta}`);
    };

    const removeItem = (id: number) => {
        console.log(`Remove ${id}`);
    };

    return (
        <WebLayout>
            <Head title={heading} />

            <div className="min-h-screen bg-gray-50 py-8 md:py-12">
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900 md:text-4xl">
                            <ShoppingBag className="h-9 w-9 text-blue-600" />
                            {heading}
                        </h1>

                        <Button variant="outline" asChild size="sm">
                            <Link href={continueShoppingHref}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {continueShoppingText}
                            </Link>
                        </Button>
                    </div>

                    {items.length === 0 ? (
                        <Card className="py-16 text-center">
                            <CardContent>
                                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                                    Your cart is empty
                                </h2>
                                <p className="mb-6 text-gray-600">
                                    Looks like you haven't added anything yet.
                                </p>
                                <Button asChild size="lg" className="mt-6">
                                    <Link href={continueShoppingHref}>
                                        {continueShoppingText}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Cart Items */}
                            <div className="space-y-6 lg:col-span-2">
                                {items.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="overflow-hidden"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col gap-6 sm:flex-row">
                                                {/* Image */}
                                                <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100 sm:w-40">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                                                            {item.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            ₹
                                                            {item.price.toLocaleString(
                                                                'en-IN',
                                                            )}
                                                        </p>
                                                    </div>

                                                    {/* Quantity & Remove */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 rounded-md border">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-none"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity -
                                                                            1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity <=
                                                                    1
                                                                }
                                                            >
                                                                <Minus
                                                                    size={16}
                                                                />
                                                            </Button>
                                                            <span className="w-10 text-center font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-none"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity +
                                                                            1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    item.quantity >=
                                                                    (item.maxQuantity ||
                                                                        99)
                                                                }
                                                            >
                                                                <Plus
                                                                    size={16}
                                                                />
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                removeItem(
                                                                    item.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={16}
                                                                className="mr-2"
                                                            />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="min-w-[120px] text-right">
                                                    <p className="text-xl font-bold text-emerald-600">
                                                        ₹
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        ₹
                                                        {item.price.toLocaleString(
                                                            'en-IN',
                                                        )}{' '}
                                                        × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-24">
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {subtotalLabel}
                                                </span>
                                                <span>
                                                    ₹
                                                    {subtotal.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {shippingLabel}
                                                </span>
                                                <span className="text-green-600">
                                                    {shippingValue}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>{totalLabel}</span>
                                                <span>
                                                    ₹
                                                    {total.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full py-6 text-lg"
                                            size="lg"
                                        >
                                            {proceedToCheckoutText}
                                        </Button>

                                        <p className="text-center text-sm text-gray-500">
                                            Taxes and shipping calculated at
                                            checkout
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </WebLayout>
    );
}
