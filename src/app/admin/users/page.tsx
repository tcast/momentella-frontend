import Link from "next/link";
import { UsersAdminTable } from "@/components/admin/UsersAdminTable";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  createdAt: string;
};

export default async function AdminUsersPage() {
  const data = await serverFetchJson<{ users: UserRow[] }>("/api/admin/users");
  const users = data?.users ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← Overview
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Users
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Roles: <code className="rounded bg-canvas px-1">client</code> (portal) and{" "}
          <code className="rounded bg-canvas px-1">admin</code> (this console). Banning
          blocks sign-in when your auth layer enforces it.
        </p>
      </div>
      <UsersAdminTable users={users} />
    </div>
  );
}
