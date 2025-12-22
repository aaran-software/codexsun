import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
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

interface Tag {
    id: number;
    name: string;
    slug: string;
    active_id: number;
}

interface Props {
    tag: Tag;
}

export default function Edit({ tag }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: tag.name,
        slug: tag.slug,
        active_id: tag.active_id,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('blog.tags.update', tag.id));
    };

    return (
        <AppLayout title="Edit Tag">
            <Head title={`Edit ${tag.name}`} />

            <div className="mx-auto max-w-xl px-4 py-8">
                <h1 className="mb-6 text-lg sm:text-2xl font-bold">
                    Edit Blog Tag
                </h1>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Slug</Label>
                        <Input
                            value={data.slug}
                            onChange={(e) =>
                                setData('slug', e.target.value)
                            }
                        />
                        {errors.slug && (
                            <p className="text-sm text-red-500">
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Status</Label>
                        <Select
                            value={data.active_id}
                            onValueChange={(v) => setData('active_id', Number(v))}

                        >
                            <SelectTrigger className={"bg-background text-foreground"}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled={processing}>
                            Update Tag
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
