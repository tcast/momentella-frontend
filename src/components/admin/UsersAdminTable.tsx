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
  const [pending, startTransition] = useTransition();

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
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent-deep"
                    >
                      {initials(u.name, u.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink">
                        {u.name || "—"}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {u.email}
                      </p>
                    </div>
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
