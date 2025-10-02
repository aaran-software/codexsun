import { Toaster } from "sonner";
import { DataTable } from "./user-ui";
import { schema } from "./user-data";
import { z } from "zod";

// Sample data for the table
const sampleData: z.infer<typeof schema>[] = [
  {
    id: 1,
    header: "Introduction",
    type: "Table of Contents",
    status: "Done",
    target: "100",
    limit: "200",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Technical Approach",
    type: "Technical Approach",
    status: "In Progress",
    target: "150",
    limit: "300",
    reviewer: "Assign reviewer",
  },
  {
    id: 3,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "Not Started",
    target: "120",
    limit: "250",
    reviewer: "Emily Whalen",
  },
  {
    id: 4,
    header: "Design Overview",
    type: "Design",
    status: "In Progress",
    target: "80",
    limit: "180",
    reviewer: "Jamik Tashpulatov",
  },
];

function UserList() {
  return (
    <div className="p-4">
      <Toaster />
      <DataTable data={sampleData} />
    </div>
  );
}

export default UserList;
