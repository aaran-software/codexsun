'use client';
import Layout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'

import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { route } from 'ziggy-js';

interface Props {
    onSuccess?: () => void;
}

export default function TagForm({ onSuccess }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        active_id: '1',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('blog.tags.store'), {
            onSuccess: () => {
                onSuccess?.();
            },
        });
    };

    return (
        <Layout>
            <Head title="Create"/>
            <h1 className="mb-6 text-lg sm:text-2xl font-bold pl-10 pt-10">
                Create Blog Tag
            </h1>
            <form onSubmit={submit} className="space-y-5 p-10">
                <div>
                    <Label>Name</Label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                </div>

                <div>
                    <Label>Slug</Label>
                    <Input
                        value={data.slug}
                        onChange={(e) => setData('slug', e.target.value)}
                    />
                    {errors.slug && (
                        <p className="text-sm text-red-500">{errors.slug}</p>
                    )}
                </div>

                <div>
                    <Label>Status</Label>
                    <Select
                        value={data.active_id}
                        onValueChange={(v) => setData('active_id', v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={processing}>
                        Create Tag
                    </Button>
                </div>
            </form>

        </Layout>
    );
}

