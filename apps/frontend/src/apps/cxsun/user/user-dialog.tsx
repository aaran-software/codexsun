import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, MailPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectDropdown } from "./select-dropdown";
import { ConfirmDialog } from "./confirm-dialog";
import { useUsers } from "./users-provider";
import { schema, roles } from "./user-data";

type Item = z.infer<typeof schema>;

const addEditFormSchema = z
    .object({
        username: z.string().min(1, "Username is required."),
        email: z.string().email({
            message: (iss) => (iss.input === "" ? "Email is required." : "Invalid email format."),
        }),
        password_hash: z.string().transform((pwd) => pwd.trim()),
        tenant_id: z.string().min(1, "Tenant ID is required."),
        role: z.string().min(1, "Role is required."),
        isEdit: z.boolean(),
    })
    .refine(
        (data) => (data.isEdit && !data.password_hash ? true : data.password_hash.length > 0),
        { message: "Password is required.", path: ["password_hash"] }
    );

const inviteFormSchema = z.object({
    email: z.string().email({
        message: (iss) => (iss.input === "" ? "Please enter an email to invite." : "Invalid email format."),
    }),
    role: z.string().min(1, "Role is required."),
    desc: z.string().optional(),
});

type AddEditForm = z.infer<typeof addEditFormSchema>;
type InviteForm = z.infer<typeof inviteFormSchema>;

export function UsersDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useUsers();
    const [deleteConfirmValue, setDeleteConfirmValue] = React.useState("");

    const addEditForm = useForm<AddEditForm>({
        resolver: zodResolver(addEditFormSchema),
        defaultValues: {
            username: currentRow?.username || "",
            email: currentRow?.email || "",
            password_hash: currentRow?.password_hash || "",
            tenant_id: currentRow?.tenant_id || "",
            role: currentRow?.role || "",
            isEdit: open === "edit",
        },
    });

    const inviteForm = useForm<InviteForm>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: { email: "", role: "Viewer", desc: "" },
    });

    React.useEffect(() => {
        if (open === "edit" && currentRow) {
            addEditForm.reset({
                username: currentRow.username,
                email: currentRow.email,
                password_hash: currentRow.password_hash,
                tenant_id: currentRow.tenant_id,
                role: currentRow.role,
                isEdit: true,
            });
        } else if (open === "add") {
            addEditForm.reset({
                username: "",
                email: "",
                password_hash: "",
                tenant_id: "",
                role: "",
                isEdit: false,
            });
        }
    }, [open, currentRow, addEditForm]);

    const handleAddEditSubmit = (values: AddEditForm) => {
        const { isEdit, ...data } = values;
        const meta = (window as any).tableMeta; // Access table meta globally (set in user-logic.tsx)
        if (isEdit && currentRow) {
            meta?.updateData(currentRow.id, data);
        } else {
            meta?.addData(data);
        }
        setOpen(null);
        setCurrentRow(null);
        addEditForm.reset();
    };

    const handleInviteSubmit = (values: InviteForm) => {
        const meta = (window as any).tableMeta;
        meta?.addData({
            username: values.email.split("@")[0], // Derive username from email
            email: values.email,
            password_hash: "invited",
            tenant_id: "default_tenant", // Default value
            role: values.role,
        });
        setOpen(null);
        inviteForm.reset();
    };

    const handleDeleteSubmit = () => {
        if (deleteConfirmValue.trim() !== currentRow?.username) return;
        const meta = (window as any).tableMeta;
        meta?.deleteData([currentRow?.id]);
        setOpen(null);
        setCurrentRow(null);
        setDeleteConfirmValue("");
    };

    return (
        <>
            {/* Add/Edit Dialog */}
            <Dialog open={open === "add" || open === "edit"} onOpenChange={() => setOpen(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{open === "edit" ? "Edit User" : "Add New User"}</DialogTitle>
                        <DialogDescription>
                            {open === "edit" ? "Update the details for the user." : "Fill in the details for the new user."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...addEditForm}>
                        <form
                            id="user-form"
                            onSubmit={addEditForm.handleSubmit(handleAddEditSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={addEditForm.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Username</FormLabel>
                                        <FormControl>
                                            <Input className="col-span-3" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-3 col-start-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addEditForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Email</FormLabel>
                                        <FormControl>
                                            <Input className="col-span-3" type="email" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-3 col-start-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addEditForm.control}
                                name="password_hash"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Password Hash</FormLabel>
                                        <FormControl>
                                            <Input className="col-span-3" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-3 col-start-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addEditForm.control}
                                name="tenant_id"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Tenant ID</FormLabel>
                                        <FormControl>
                                            <Input className="col-span-3" {...field} />
                                        </FormControl>
                                        <FormMessage className="col-span-3 col-start-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={addEditForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Role</FormLabel>
                                        <FormControl>
                                            <SelectDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select a role"
                                                items={roles}
                                                className="col-span-3"
                                            />
                                        </FormControl>
                                        <FormMessage className="col-span-3 col-start-2" />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="user-form">
                            {open === "edit" ? "Save Changes" : "Add User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={open === "invite"} onOpenChange={() => setOpen(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-start">
                        <DialogTitle className="flex items-center gap-2">
                            <MailPlus /> Invite User
                        </DialogTitle>
                        <DialogDescription>
                            Invite new user to join your team by sending them an email invitation. Assign a role to define their access level.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...inviteForm}>
                        <form
                            id="user-invite-form"
                            onSubmit={inviteForm.handleSubmit(handleInviteSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={inviteForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="eg: john.doe@gmail.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={inviteForm.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <SelectDropdown
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select a role"
                                                items={roles}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={inviteForm.control}
                                name="desc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none"
                                                placeholder="Add a personal note to your invitation (optional)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter className="gap-y-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form="user-invite-form">
                            Invite <Send />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            {currentRow && (
                <ConfirmDialog
                    open={open === "delete"}
                    onOpenChange={() => setOpen(null)}
                    handleConfirm={handleDeleteSubmit}
                    disabled={deleteConfirmValue.trim() !== currentRow?.username}
                    title={
                        <span className="text-destructive">
                            <AlertTriangle className="stroke-destructive me-1 inline-block" size={18} /> Delete User
                        </span>
                    }
                    desc={
                        <div className="space-y-4">
                            <p className="mb-2">
                                Are you sure you want to delete <span className="font-bold">{currentRow.username}</span>?
                                <br />
                                This action will permanently remove the user with the role of{" "}
                                <span className="font-bold">{currentRow.role.toUpperCase()}</span> from the system. This cannot be undone.
                            </p>
                            <label className="my-2">
                                Username:
                                <Input
                                    value={deleteConfirmValue}
                                    onChange={(e) => setDeleteConfirmValue(e.target.value)}
                                    placeholder="Enter username to confirm deletion."
                                />
                            </label>
                            <Alert variant="destructive">
                                <AlertTitle>Warning!</AlertTitle>
                                <AlertDescription>
                                    Please be careful, this operation cannot be rolled back.
                                </AlertDescription>
                            </Alert>
                        </div>
                    }
                    confirmText="Delete"
                    destructive
                />
            )}
        </>
    );
}