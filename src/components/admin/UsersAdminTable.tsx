"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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

export function UsersAdminTable({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
    return <p className="text-sm text-ink-muted">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white/60">
      {msg ? (
        <p className="border-b border-line bg-red-50 px-3 py-2 text-sm text-red-900">
          {msg}
        </p>
      ) : null}
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wider text-ink-muted">
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-line/80 align-top">
              <td className="px-3 py-3">
                <p className="font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink-muted">{u.email}</p>
                <p className="font-mono text-[10px] text-ink-muted">{u.id}</p>
              </td>
              <td className="px-3 py-3">
                <select
                  value={u.role ?? "client"}
                  disabled={pending}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className="rounded-lg border border-line bg-canvas px-2 py-1 text-xs font-semibold"
                >
                  <option value="client">client</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="px-3 py-3 text-xs">
                {u.banned ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-900">
                    Banned
                  </span>
                ) : (
                  <span className="text-ink-muted">Active</span>
                )}
                {u.emailVerified ? (
                  <span className="ml-2 text-green-800">Verified</span>
                ) : null}
              </td>
              <td className="px-3 py-3">
                {u.banned ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => unban(u.id)}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => ban(u.id)}
                    className="text-xs font-semibold text-red-800 hover:underline"
                  >
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
