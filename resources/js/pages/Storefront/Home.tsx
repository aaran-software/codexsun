import { Head, router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebLayout from '@/layouts/web-layout';

export default function Home() {
    const { tenant, themePresets } = usePage().props as any;

    const [switchingId, setSwitchingId] = useState<number | null>(null);

    const currentPresetId = tenant?.theme?.preset_id;

    const handleSwitchPreset = (presetId: number) => {
        if (presetId === currentPresetId || switchingId) return;
        setSwitchingId(presetId);

        router.post(
            route('theme.switch'),
            { preset_id: presetId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setSwitchingId(null),
                onError: () => setSwitchingId(null),
                onFinish: () => setSwitchingId(null),
            },
        );
    };

    return (
        <WebLayout>
            <Head title={tenant?.name || 'Storefront'} />

            <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
                        {tenant?.name || 'Welcome'}
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground">
                        {tenant?.slug} • Multi-tenant Storefront
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-6">
                        <Badge
                            variant="outline"
                            className="px-4 py-2 text-base"
                        >
                            {tenant?.theme?.preset_name || 'Default Theme'}
                        </Badge>
                    </div>
                </div>

                {/* Preset Switcher */}
                <Card className="mb-16 border-2 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">
                            Theme Presets
                        </CardTitle>
                        <CardDescription>
                            Switch between color schemes — components update
                            automatically
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {themePresets?.map((preset: any) => {
                                const isActive = currentPresetId === preset.id;
                                const isSwitching = switchingId === preset.id;

                                return (
                                    <Button
                                        key={preset.id}
                                        variant={
                                            isActive ? 'default' : 'outline'
                                        }
                                        size="lg"
                                        disabled={isSwitching || isActive}
                                        onClick={() =>
                                            handleSwitchPreset(preset.id)
                                        }
                                        className={`min-w-[160px] transition-all ${isActive ? 'scale-105 shadow-xl ring-2 ring-primary/50' : 'hover:scale-105 hover:shadow-md'} `}
                                    >
                                        {isSwitching && (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        )}
                                        {preset.name}
                                        {isActive && (
                                            <span className="ml-2">✓</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Shadcn Showcase */}
                <div className="space-y-16">
                    {/* Buttons */}
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">Buttons</h2>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg">Primary Button</Button>
                            <Button variant="secondary" size="lg">
                                Secondary
                            </Button>
                            <Button variant="outline" size="lg">
                                Outline
                            </Button>
                            <Button variant="ghost" size="lg">
                                Ghost
                            </Button>
                            <Button variant="destructive" size="lg">
                                Destructive
                            </Button>
                            <Button variant="link" size="lg">
                                Link
                            </Button>
                        </div>
                    </div>

                    {/* Cards */}
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">Cards</h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Card</CardTitle>
                                    <CardDescription>
                                        Featured item
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 flex h-40 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        Image Placeholder
                                    </div>
                                    <p className="font-medium">Summer Jacket</p>
                                    <p className="mt-1 text-xl font-bold text-primary">
                                        $89.99
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full">
                                        Add to Cart
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card className="border-2 border-primary">
                                <CardHeader>
                                    <CardTitle className="text-primary">
                                        Premium Offer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-2 text-2xl font-bold">
                                        50% OFF
                                    </p>
                                    <p className="text-muted-foreground">
                                        Limited time only
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full border-primary text-primary hover:bg-primary/10"
                                    >
                                        Claim Now
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span>Orders Today</span>
                                        <span className="font-bold">187</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Revenue</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            $21,450
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Tabs + Input */}
                    <div>
                        <h2 className="mb-6 text-3xl font-bold">Tabs & Form</h2>
                        <Tabs
                            defaultValue="account"
                            className="w-full max-w-2xl"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="account">
                                    Account
                                </TabsTrigger>
                                <TabsTrigger value="password">
                                    Password
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account</CardTitle>
                                        <CardDescription>
                                            Make changes to your account here.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                defaultValue="Sundara"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                defaultValue="sundara@example.com"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">
                                            Save changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                            <TabsContent value="password">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Password</CardTitle>
                                        <CardDescription>
                                            Change your password here.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current">
                                                Current password
                                            </Label>
                                            <Input
                                                id="current"
                                                type="password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new">
                                                New password
                                            </Label>
                                            <Input id="new" type="password" />
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">
                                            Update password
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <div className="mt-24 text-center text-sm text-muted-foreground">
                    Powered by CODEXSUN Multi-Tenant Engine
                </div>
            </div>
        </WebLayout>
    );
}
