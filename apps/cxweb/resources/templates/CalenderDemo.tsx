"use client"

import * as React from "react"
import { Calendar } from "../components/ui/calendar"
import { Label } from "../components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select"

export function Calendar13() {
    const [dropdown, setDropdown] = React.useState<
        "label" | "dropdown" | "dropdown-months" | "dropdown-years"
    >("dropdown")
    const [date, setDate] = React.useState<Date | undefined>(
        new Date(2025, 5, 12)
    )

    return (
        <div className="flex flex-col gap-4">
            <Calendar
                mode="single"
                defaultMonth={date}
                selected={date}
                onSelect={setDate}
                captionLayout={dropdown}
                className="rounded-lg border shadow-sm"
            />
            <div className="flex flex-col gap-3">
                <Label htmlFor="dropdown" className="px-1">
                    Caption Layout
                </Label>
                <Select
                    value={dropdown}
                    onValueChange={(value) =>
                        setDropdown(value as "label" | "dropdown" | "dropdown-months" | "dropdown-years")
                    }
                >
                    <SelectTrigger id="dropdown" className="bg-background w-full">
                        <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent align="center">
                        <SelectItem value="dropdown">Month and Year Dropdown</SelectItem>
                        <SelectItem value="dropdown-months">Month Only Dropdown</SelectItem>
                        <SelectItem value="dropdown-years">Year Only Dropdown</SelectItem>
                        <SelectItem value="label">Label Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}