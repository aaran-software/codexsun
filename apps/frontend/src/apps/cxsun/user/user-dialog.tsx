import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { schema } from "./user-data";
import { toast } from "sonner";

type Item = z.infer<typeof schema>;

interface UserDialogProps {
    user?: Item; // Optional for add mode, required for edit mode
    mode?: "add" | "edit"; // Mode to determine dialog behavior
    onAdd?: (newItem: Omit<Item, "id" | "created_at">) => void;
    onEdit?: (id: number, updatedItem: Omit<Item, "id" | "created_at">) => void;
    children: React.ReactNode;
}

export function UserDialog({ user, mode = "add", onAdd, onEdit, children }: UserDialogProps) {
    const isEditMode = mode === "edit" && !!user;
    const [open, setOpen] = React.useState(false);
    const [username, setUsername] = React.useState(user?.username || "");
    const [email, setEmail] = React.useState(user?.email || "");
    const [password_hash, setPasswordHash] = React.useState(user?.password_hash || "");
    const [tenant_id, setTenantId] = React.useState(user?.tenant_id || "");
    const [role, setRole] = React.useState(user?.role || "");

    const handleSubmit = () => {
        const data = { username, email, password_hash, tenant_id, role };
        if (isEditMode && onEdit && user) {
            onEdit(user.id, data);
            toast.success("User updated successfully");
        } else if (onAdd) {
            onAdd(data);
            toast.success("User created successfully");
        }
        setOpen(false);
        setUsername("");
        setEmail("");
        setPasswordHash("");
        setTenantId("");
        setRole("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit User" : "Add New User"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "Update the details for the user." : "Fill in the details for the new user."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password_hash" className="text-right">Password Hash</Label>
                        <Input
                            id="password_hash"
                            value={password_hash}
                            onChange={(e) => setPasswordHash(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tenant_id" className="text-right">Tenant ID</Label>
                        <Input
                            id="tenant_id"
                            value={tenant_id}
                            onChange={(e) => setTenantId(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Editor">Editor</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>
                        {isEditMode ? "Save Changes" : "Add User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}