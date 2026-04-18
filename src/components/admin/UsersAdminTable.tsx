"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { getPublicAppUrl } from "@/lib/env-public";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  createdAt: string;
};

function initials(name: string, email: string): string {
  const base = (name || email || "?").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function formatJoined(dateISO: string): string {
  try {
    return new Date(dateISO).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function UsersAdminTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [pending, startTransition] = useTransition();

  function beginEdit(u: UserRow) {
    setEditingId(u.id);
    setEditName(u.name ?? "");
    setEditEmail(u.email);
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  }

  function saveEdit(u: UserRow) {
    const nextName = editName.trim();
    const nextEmail = editEmail.trim().toLowerCase();
    if (!nextName) {
      setMsg("Name can’t be empty.");
      return;
    }
    if (nextName === u.name && nextEmail === u.email.toLowerCase()) {
      cancelEdit();
      return;
    }
    startTransition(async () => {
      const res = await fetch(`${getPublicAppUrl()}/api/admin/users/${u.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName, email: nextEmail }),
      });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => null);
        setMsg(
          j && typeof j === "object" && "error" in j
            ? String((j as { error: unknown }).error)
            : "Could not save",
        );
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.role ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, query]);

  function setRole(userId: string, role: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        },
      );
      if (!res.ok) {
        setMsg("Could not update role");
        return;
      }
      router.refresh();
    });
  }

  function ban(userId: string) {
    if (!confirm("Ban this user? They won’t be able to sign in.")) return;
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/users/${userId}/ban`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      if (!res.ok) {
        setMsg("Could not ban user");
        return;
      }
      router.refresh();
    });
  }

  function unban(userId: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await fetch(
        `${getPublicAppUrl()}/api/admin/users/${userId}/unban`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        setMsg("Could not unban user");
        return;
      }
      router.refresh();
    });
  }

  if (users.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-canvas/40 px-6 py-10 text-center text-sm text-ink-muted">
        No users yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {msg ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {msg}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by name, email, or role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-md rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
        />
        <span className="text-xs text-ink-muted">
          Showing {filtered.length} of {users.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-canvas/60">
            <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-ink-muted">
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                className="border-b border-line/70 transition-colors last:border-b-0 hover:bg-canvas/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-deep"
                    >
                      {initials(
                        editingId === u.id ? editName : u.name,
                        editingId === u.id ? editEmail : u.email,
                      )}
                    </div>
                    {editingId === u.id ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Full name"
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm font-semibold text-ink"
                          autoFocus
                        />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink-muted"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(u)}
                            disabled={pending}
                            className="rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-canvas hover:bg-accent-deep disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={pending}
                            className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-ink-muted hover:bg-canvas"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-ink">
                          {u.name || "—"}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {u.email}
                        </p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={u.role ?? "client"}
                    disabled={pending}
                    onChange={(e) => setRole(u.id, e.target.value)}
                    className="rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-semibold text-ink"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    {u.banned ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-900">
                        Banned
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-900">
                        Active
                      </span>
                    )}
                    {u.emailVerified ? (
                      <span className="text-[11px] font-medium text-ink-muted">
                        Email verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-700">
                        Email unverified
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-ink-muted">
                  {formatJoined(u.createdAt)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === u.id ? null : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => beginEdit(u)}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-60"
                      >
                        Edit
                      </button>
                    )}
                    {u.banned ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => unban(u.id)}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-canvas disabled:opacity-60"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => ban(u.id)}
                        className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
                      >
                        Ban
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-ink-muted"
                >
                  No users match “{query}”.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
