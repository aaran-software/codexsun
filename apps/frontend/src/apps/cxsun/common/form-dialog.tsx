// File: components/form-dialog.tsx
// Description: Reusable FormDialog component for any entity CRUD.
// Notes for study:
// - Generic <T> for data type.
// - Accepts schema, fields config (name, label, type, options for select).
// - Handles form rendering dynamically based on fields.
// - Usable across modules for any form-based dialog.
// - Fixed by correcting imports for Dialog, Form, and adding missing components.

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { SelectDropdown } from "@/apps/cxsun/user/to/select-dropdown";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'select' | 'textarea';
    options?: { label: string; value: string }[]; // For select.
};

type FormDialogProps<T> = {
    open: boolean;
    onClose: () => void;
    schema: z.ZodSchema<any>;
    defaultValues: Partial<T>;
    onSubmit: (values: any) => void;
    title: string;
    description: string;
    fields: FieldConfig[];
};

export function FormDialog<T>({ open, onClose, schema, defaultValues, onSubmit, title, description, fields }: FormDialogProps<T>) {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {fields.map((field) => (
                            <FormField
                                key={field.name}
                                control={form.control}
                                name={field.name}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>{field.label}</FormLabel>
                                        <FormControl>
                                            {field.type === 'select' ? (
                                                <SelectDropdown
                                                    defaultValue={formField.value}
                                                    onValueChange={formField.onChange}
                                                    placeholder="Select"
                                                    items={field.options || []}
                                                />
                                            ) : field.type === 'textarea' ? (
                                                <Textarea {...formField} />
                                            ) : (
                                                <Input type={field.type} {...formField} />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </form>
                </Form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit</Button> {/* Removed form="form-id" as no id specified */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}