import React, { useEffect, useState } from "react";

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
};

export default function TenantList() {
    const [rows, setRows] = useState<Tenant[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchTenants(signal?: AbortSignal) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:3006/api/tenants", { signal });
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

    useEffect(() => {
        const ctl = new AbortController();
        fetchTenants(ctl.signal);
        return () => ctl.abort();
    }, []);

    return (
        <section>
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Tenant List</h2>
                <small style={{ color: "#666" }}>
                    {rows.length} loaded{totalCount ? ` / ${totalCount}` : ""}
                </small>
            </div>

            <div style={{ overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr style={{ background: "#f8fafc" }}>
                        <th style={th}>ID</th>
                        <th style={th}>Name</th>
                        <th style={th}>Created</th>
                        <th style={th}>Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((t) => (
                        <tr key={t.id}>
                            <td style={tdMono}>{t.id}</td>
                            <td style={td}>{t.name}</td>
                            <td style={td}>{new Date(t.createdAt).toLocaleString()}</td>
                            <td style={td}>{new Date(t.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    {!rows.length && !loading && !error && (
                        <tr>
                            <td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No tenants</td>
                        </tr>
                    )}
                    {error && (
                        <tr>
                            <td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#b91c1c" }}>
                                {error}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => fetchTenants()} disabled={loading}>
                    {loading ? "Loading…" : "Refresh"}
                </button>
            </div>
        </section>
    );
}

const th: React.CSSProperties = { textAlign: "left", padding: 12, fontWeight: 600, borderBottom: "1px solid #e5e7eb" };
const td: React.CSSProperties = { padding: 12, borderBottom: "1px solid #f1f5f9" };
const tdMono: React.CSSProperties = {
    ...td,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
};
