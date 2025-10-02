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

type Item = z.infer<typeof schema>;

interface AddSectionDialogProps {
    onAdd: (newItem: Omit<Item, "id">) => void;
    children: React.ReactNode;
}

export function AddSectionDialog({ onAdd, children }: AddSectionDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [header, setHeader] = React.useState("");
    const [type, setType] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [target, setTarget] = React.useState("");
    const [limit, setLimit] = React.useState("");
    const [reviewer, setReviewer] = React.useState("");

    const handleSubmit = () => {
        onAdd({ header, type, status, target, limit, reviewer });
        setOpen(false);
        setHeader("");
        setType("");
        setStatus("");
        setTarget("");
        setLimit("");
        setReviewer("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>Fill in the details for the new section.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="header" className="text-right">Header</Label>
                        <Input id="header" value={header} onChange={(e) => setHeader(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Table of Contents">Table of Contents</SelectItem>
                                <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                                <SelectItem value="Technical Approach">Technical Approach</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Capabilities">Capabilities</SelectItem>
                                <SelectItem value="Focus Documents">Focus Documents</SelectItem>
                                <SelectItem value="Narrative">Narrative</SelectItem>
                                <SelectItem value="Cover Page">Cover Page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Done">Done</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="target" className="text-right">Target</Label>
                        <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="limit" className="text-right">Limit</Label>
                        <Input id="limit" value={limit} onChange={(e) => setLimit(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reviewer" className="text-right">Reviewer</Label>
                        <Select value={reviewer} onValueChange={setReviewer}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select reviewer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                                <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
                                <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Add Section</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}