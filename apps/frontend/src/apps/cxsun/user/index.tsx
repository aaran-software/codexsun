import { Toaster } from "sonner";
import { DataTable } from "./user-ui";
import { schema } from "./user-data";
import { z } from "zod";

// Sample data for the table
const sampleData: z.infer<typeof schema>[] = [
    {
        id: 1,
        username: "john_doe",
        email: "john.doe@example.com",
        password_hash: "hashed_password_1",
        tenant_id: "tenant_001",
        role: "Admin",
        created_at: "2025-01-01T10:00:00Z",
    },
    {
        id: 2,
        username: "jane_smith",
        email: "jane.smith@example.com",
        password_hash: "hashed_password_2",
        tenant_id: "tenant_002",
        role: "Editor",
        created_at: "2025-02-01T12:00:00Z",
    },
    {
        id: 3,
        username: "bob_jones",
        email: "bob.jones@example.com",
        password_hash: "hashed_password_3",
        tenant_id: "tenant_001",
        role: "Viewer",
        created_at: "2025-03-01T14:00:00Z",
    },
    {
        id: 4,
        username: "alice_brown",
        email: "alice.brown@example.com",
        password_hash: "hashed_password_4",
        tenant_id: "tenant_003",
        role: "Editor",
        created_at: "2025-04-01T16:00:00Z",
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