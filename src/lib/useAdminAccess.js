/**
 * useAdminAccess — Shared hook for role-based access control.
 * Roles: super_admin > admin > employee
 */
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export function useAdminAccess() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); setChecked(true); })
      .catch(() => setChecked(true));
  }, []);

  const role = user?.role || "employee";
  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";
  const isEmployee = !isAdmin;

  return { user, checked, role, isSuperAdmin, isAdmin, isEmployee };
}