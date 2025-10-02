import { z } from "zod";
import { ChartConfig } from "@/components/ui/chart";

// Schema for table data
export const schema = z.object({
    id: z.number(),
    header: z.string(),
    type: z.string(),
    status: z.string(),
    target: z.string(),
    limit: z.string(),
    reviewer: z.string(),
});

// Sample chart data for visualization
export const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

// Chart configuration with distinct colors
export const chartConfig: ChartConfig = {
    desktop: {
        label: "Desktop",
        color: "#3b82f6", // Blue for desktop
    },
    mobile: {
        label: "Mobile",
        color: "#10b981", // Green for mobile
    },
};