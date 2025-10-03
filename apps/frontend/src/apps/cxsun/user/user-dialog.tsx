// File: user-dialog.tsx
// Description: User-specific dialogs using generic form components.
// Notes for study:
// - Uses reusable FormDialog and ConfirmDialog.
// - Specific schemas for add/edit/invite filled from original.
// - roles defined based on filters.
// - Handlers defined using window.tableMeta as in original.
// - Changed useDataContext to useUsers for consistency with provider.

import * as React from "react";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormDialog } from "@/apps/cxsun/common/form-dialog";
import { ConfirmDialog } from "@/apps/cxsun/common/confirm-dialog";
import { useUsers } from "./user-provider"; // Fixed to useUsers.
import { type User } from "./user-schema"; // Existing reusable.

type FieldConfig = {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'select' | 'textarea';
    options?: { label: string; value: string }[]; // For select.
};

const roles = [
    { label: "Admin", value: "Admin" },
    { label: "Editor", value: "Editor" },
    { label: "Viewer", value: "Viewer" },
];

const addEditSchema = z
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

const inviteSchema = z.object({
    email: z.string().email({
        message: (iss) => (iss.input === "" ? "Please enter an email to invite." : "Invalid email format."),
    }),
    role: z.string().min(1, "Role is required."),
    desc: z.string().optional(),
});

export function UsersDialog() {
    const { open, setOpen, currentRow, setCurrentRow } = useUsers();
    const [deleteConfirmValue, setDeleteConfirmValue] = React.useState("");

    const handleAddEditSubmit = (values: z.infer<typeof addEditSchema>) => {
        const { isEdit, ...data } = values;
        const meta = (window as any).tableMeta;
        if (isEdit && currentRow) {
            meta?.updateData(currentRow.id, data);
        } else {
            meta?.addData(data);
        }
        setOpen(null);
        setCurrentRow(null);
    };

    const handleInviteSubmit = (values: z.infer<typeof inviteSchema>) => {
        const meta = (window as any).tableMeta;
        meta?.addData({
            username: values.email.split("@")[0],
            email: values.email,
            password_hash: "invited",
            tenant_id: "default_tenant",
            role: values.role,
        });
        setOpen(null);
    };

    const handleDeleteSubmit = () => {
        if (deleteConfirmValue.trim() !== currentRow?.username) return;
        const meta = (window as any).tableMeta;
        meta?.deleteData([currentRow?.id]);
        setOpen(null);
        setCurrentRow(null);
        setDeleteConfirmValue("");
    };

    const addEditDefaultValues = open === "edit" && currentRow
        ? {
            username: currentRow.username,
            email: currentRow.email,
            password_hash: currentRow.password_hash,
            tenant_id: currentRow.tenant_id,
            role: currentRow.role,
            isEdit: true,
        }
        : {
            username: "",
            email: "",
            password_hash: "",
            tenant_id: "",
            role: "",
            isEdit: false,
        };

    return (
        <>
            <FormDialog
                open={open === "add" || open === "edit"}
                onClose={() => setOpen(null)}
                schema={addEditSchema}
                defaultValues={addEditDefaultValues}
                onSubmit={handleAddEditSubmit}
                title={open === "edit" ? "Edit User" : "Add New User"}
                description={open === "edit" ? "Update the details for the user." : "Fill in the details for the new user."}
                fields={[
                    { name: "username", label: "Username", type: "text" },
                    { name: "email", label: "Email", type: "email" },
                    { name: "password_hash", label: "Password Hash", type: "text" },
                    { name: "tenant_id", label: "Tenant ID", type: "text" },
                    { name: "role", label: "Role", type: "select", options: roles },
                ]}
            />
            <FormDialog
                open={open === "invite"}
                onClose={() => setOpen(null)}
                schema={inviteSchema}
                defaultValues={{ email: "", role: "Viewer", desc: "" }}
                onSubmit={handleInviteSubmit}
                title="Invite User"
                description="Invite new user to join your team by sending them an email invitation. Assign a role to define their access level."
                fields={[
                    { name: "email", label: "Email", type: "email" },
                    { name: "role", label: "Role", type: "select", options: roles },
                    { name: "desc", label: "Description (optional)", type: "textarea" },
                ]}
            />
            {currentRow && (
                <ConfirmDialog
                    open={open === "delete"}
                    onOpenChange={() => setOpen(null)}
                    handleConfirm={handleDeleteSubmit}
                    disabled={deleteConfirmValue.trim() !== currentRow.username}
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