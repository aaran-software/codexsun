// File: index.tsx
// Description: Main entry point for the UserList component.
// Notes for study:
// - Initializes sample data and renders the generic DataTable wrapped with Toaster.
// - Uses a generic DataTable that can be reused for other data types by passing different schemas, columns, etc.
// - sampleData is now complete with all entries from original.

import { Toaster } from "sonner";
import { DataTable } from "@/apps/cxsun/common/data-table"; // Reusable DataTable component.
import { userSchema, type User } from "./user-schema"; // User-specific schema.
import { columns as userColumns } from "./user-columns"; // User-specific columns.
import { UsersDialog } from "./user-dialog";
import { UsersPrimaryButtons } from "./user-primary-buttons";
import { UserProvider } from "./user-provider";

// Complete sample data array.
const sampleData: User[] = [
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
            <UserProvider> {/* Provider specific to users */}
                <DataTable<User>
                    initialData={sampleData}
                    schema={userSchema}
                    columns={userColumns}
                    primaryButtons={<UsersPrimaryButtons />} // Pass user-specific buttons.
                    dialogs={<UsersDialog />} // Pass user-specific dialogs.
                    searchPlaceholder="Filter usernames..."
                    searchKey="username"
                    filters={[
                        {
                            columnId: "role",
                            title: "Role",
                            options: [
                                { label: "Admin", value: "Admin" },
                                { label: "Editor", value: "Editor" },
                                { label: "Viewer", value: "Viewer" },
                            ],
                        },
                    ]}
                />
            </UserProvider>
        </div>
    );
}

export default UserList;