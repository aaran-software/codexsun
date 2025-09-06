import React, { useEffect, useMemo, useState } from "react";

export type Tenant = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type ListResult<T> = {
    ok: boolean;
    count: number;
    items: T[];
    nextCursor?: string;
};

const API_BASE = "http://localhost:3006";

export default function TenantList() {
    const [rows, setRows] = useState<Tenant[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null); // per-row busy
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    // Add form
    const [newName, setNewName] = useState("");

    // Inline edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const canCreate = useMemo(() => newName.trim().length > 0, [newName]);
    const canSave = useMemo(
        () => editingId != null && editName.trim().length > 0,
        [editingId, editName]
    );

    async function fetchTenants(signal?: AbortSignal) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/tenants`, { signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: ListResult<Tenant> = await res.json();
            if (data.ok) {
                setRows(data.items);
                setTotalCount(data.count ?? data.items.length);
            } else {
                throw new Error("Backend returned ok=false");
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                console.error("Failed to fetch tenants", err);
                setError(err?.message ?? "Failed to fetch tenants");
            }
        } finally {
            setLoading(false);
        }
    }

    async function createTenant() {
        if (!canCreate) {
            setError("Name is required");
            return;
        }
        setBusyId("__create__");
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/tenants`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const payload = await res.json();
            if (!res.ok || !payload?.ok) {
                throw new Error(payload?.message ?? `Create failed: HTTP ${res.status}`);
            }
            setNewName("");
            setNotice("Tenant created");
            await fetchTenants();
        } catch (err: any) {
            setError(err?.message ?? "Failed to create tenant");
        } finally {
            setBusyId(null);
        }
    }

    function startEdit(t: Tenant) {
        setEditingId(t.id);
        setEditName(t.name);
        setNotice(null);
        setError(null);
    }
    function cancelEdit() {
        setEditingId(null);
        setEditName("");
    }

    async function saveEdit(id: string) {
        if (!canSave) { setError("Name is required"); return; }
        setBusyId(id);
        try {
            let res = await fetch(`${API_BASE}/api/tenants/${id}`, {
                method: "PUT",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: editName.trim() }),
            });

            // Fallback if PUT is not routed
            if (res.status === 404) {
                res = await fetch(`${API_BASE}/api/tenants/${id}?_method=PUT`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "x-http-method-override": "PUT",
                    },
                    body: JSON.stringify({ name: editName.trim() }),
                });
            }

            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.ok) {
                throw new Error(payload?.message ?? `Update failed: HTTP ${res.status}`);
            }
            setNotice("Tenant updated");
            cancelEdit();
            await fetchTenants();
        } catch (err: any) {
            setError(err?.message ?? "Failed to update tenant");
        } finally {
            setBusyId(null);
        }
    }

    async function deleteTenant(id: string) {
        if (!confirm("Delete this tenant?")) return;
        setBusyId(id);
        try {
            let res = await fetch(`${API_BASE}/api/tenants/${id}`, { method: "DELETE" });

            // Fallback if DELETE is not routed
            if (res.status === 404) {
                res = await fetch(`${API_BASE}/api/tenants/${id}?_method=DELETE`, {
                    method: "POST",
                    headers: { "x-http-method-override": "DELETE" },
                });
            }

            const payload = await res.json().catch(() => null);
            if (!res.ok || !payload?.ok) {
                throw new Error(payload?.message ?? `Delete failed: HTTP ${res.status}`);
            }
            setNotice("Tenant deleted");
            await fetchTenants();
        } catch (err: any) {
            setError(err?.message ?? "Failed to delete tenant");
        } finally {
            setBusyId(null);
        }
    }


    useEffect(() => {
        const ctl = new AbortController();
        fetchTenants(ctl.signal);
        return () => ctl.abort();
    }, []);

    return (
        <section>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h2>Tenant List</h2>
                <small style={{ color: "#666" }}>
                    {rows.length} loaded{totalCount ? ` / ${totalCount}` : ""}
                </small>
            </div>

            {/* Add tenant form */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="New tenant name…"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={input}
                />
                <button
                    onClick={createTenant}
                    disabled={!canCreate || busyId === "__create__"}
                    style={buttonPrimary}
                >
                    {busyId === "__create__" ? "Creating…" : "Add"}
                </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f8fafc" }}>
                    <th style={th}>ID</th>
                    <th style={th}>Name</th>
                    <th style={th}>Created</th>
                    <th style={th}>Updated</th>
                    <th style={th}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {rows.map((t) => {
                    const isEditing = editingId === t.id;
                    return (
                        <tr key={t.id}>
                            <td style={tdMono}>{t.id}</td>
                            <td style={td}>
                                {isEditing ? (
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={input}
                                    />
                                ) : (
                                    t.name
                                )}
                            </td>
                            <td style={td}>{new Date(t.createdAt).toLocaleString()}</td>
                            <td style={td}>{new Date(t.updatedAt).toLocaleString()}</td>
                            <td style={td}>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => saveEdit(t.id)}
                                            disabled={!canSave || busyId === t.id}
                                            style={buttonPrimary}
                                        >
                                            Save
                                        </button>
                                        <button onClick={cancelEdit} style={button}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(t)} style={button}>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTenant(t.id)}
                                            style={buttonDanger}
                                            disabled={busyId === t.id}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    );
                })}
                {!rows.length && !loading && (
                    <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: 16, color: "#666" }}>
                            No tenants
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {error && <div style={{ color: "#b91c1c", marginTop: 8 }}>{error}</div>}
            {notice && <div style={{ color: "#065f46", marginTop: 8 }}>{notice}</div>}
        </section>
    );
}

/* Styles */
const th: React.CSSProperties = {
    textAlign: "left",
    padding: 8,
    borderBottom: "1px solid #e5e7eb",
};
const td: React.CSSProperties = { padding: 8, borderBottom: "1px solid #f1f5f9" };
const tdMono: React.CSSProperties = {
    ...td,
    fontFamily: "monospace",
    whiteSpace: "nowrap",
};
const input: React.CSSProperties = {
    padding: "6px 8px",
    border: "1px solid #d1d5db",
    borderRadius: 4,
};
const button: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 4,
    background: "white",
    cursor: "pointer",
};
const buttonPrimary: React.CSSProperties = {
    ...button,
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "white",
};
const buttonDanger: React.CSSProperties = {
    ...button,
    background: "#ef4444",
    borderColor: "#ef4444",
    color: "white",
};
