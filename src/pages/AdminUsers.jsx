/**
 * AdminUsers — User management page.
 * Super Admin: can view all users, change any role (except demoting other super_admins).
 * Admin: read-only view.
 * Route: /admin/users
 */
import { useState, useEffect } from "react";
import { useAdminAccess } from "@/lib/useAdminAccess";
import { base44 } from "@/api/base44Client";
import ICShell from "@/components/importCenter/ICShell";

const ROLE_LABELS = {
  super_admin: { label: "Super Admin", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  admin:       { label: "Admin",       color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
  employee:    { label: "Employee",    color: "#475569", bg: "#f8fafc", border: "#cbd5e1" },
};

function RolePill({ role }) {
  const r = ROLE_LABELS[role] || ROLE_LABELS.employee;
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, background: r.bg, border: `1px solid ${r.border}`, color: r.color, fontSize: 11, fontWeight: 700 }}>
      {r.label}
    </span>
  );
}

export default function AdminUsers() {
  const { user: me, checked, isSuperAdmin, isAdmin } = useAdminAccess();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!checked || !isAdmin) return;
    base44.entities.User.list("-created_date", 500)
      .then(data => setUsers(data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [checked, isAdmin]);

  async function handleRoleChange(userId, newRole, currentRole) {
    // Only super_admin can promote/demote; cannot demote another super_admin
    if (!isSuperAdmin) return;
    if (currentRole === "super_admin" && userId !== me?.id) {
      setMsg({ text: "Cannot change another Super Admin's role.", error: true });
      return;
    }
    setSaving(userId);
    try {
      await base44.entities.User.update(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMsg({ text: `Role updated to ${ROLE_LABELS[newRole]?.label}.`, error: false });
    } catch (e) {
      setMsg({ text: "Failed: " + e.message, error: true });
    } finally {
      setSaving(null);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  return (
    <ICShell>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0C2340", margin: 0 }}>User Management</h1>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#f5f3ff", color: "#7c3aed", border: "1px solid #c4b5fd", borderRadius: 99, padding: "2px 10px" }}>
            ADMIN ONLY
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0" }}>
          Manage user roles and access levels. New users are automatically assigned the Employee role.
        </p>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 12, fontWeight: 700, background: msg.error ? "#fef2f2" : "#f0fdf4", color: msg.error ? "#dc2626" : "#166534", border: `1px solid ${msg.error ? "#fca5a5" : "#86efac"}` }}>
          {msg.text}
        </div>
      )}

      {/* Role legend */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {Object.entries(ROLE_LABELS).map(([key, r]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: r.bg, border: `1px solid ${r.border}`, borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.label}</span>
            <span style={{ fontSize: 10, color: "#64748b" }}>
              {key === "super_admin" && "— Full access, user management"}
              {key === "admin" && "— Admin tools access"}
              {key === "employee" && "— Catalog & app only"}
            </span>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading users…</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 100px", gap: 12, padding: "10px 20px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span>User</span><span>Email</span><span>Role</span><span>Change Role</span>
          </div>

          {users.length === 0 && (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#94a3b8" }}>No users found.</div>
          )}

          {users.map((u, i) => {
            const isMe = u.id === me?.id;
            const isOtherSuperAdmin = u.role === "super_admin" && !isMe;
            const canChange = isSuperAdmin && !isOtherSuperAdmin;

            return (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 100px", gap: 12, alignItems: "center", padding: "12px 20px", borderBottom: i < users.length - 1 ? "1px solid #f1f5f9" : "none", background: isMe ? "#fafff4" : undefined }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0C2340" }}>
                    {u.full_name || "—"} {isMe && <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 800 }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{u.email}</div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", wordBreak: "break-all" }}>{u.email}</div>
                <div><RolePill role={u.role || "employee"} /></div>
                <div>
                  {canChange ? (
                    <select
                      value={u.role || "employee"}
                      onChange={e => handleRoleChange(u.id, e.target.value, u.role)}
                      disabled={saving === u.id}
                      style={{ padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 11, color: "#334155", background: "#fff", cursor: "pointer", outline: "none" }}>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="employee">Employee</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: 10, color: "#cbd5e1" }}>{isOtherSuperAdmin ? "Protected" : "—"}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ICShell>
  );
}