"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
}

const TOP: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/intake", label: "Forms" },
  { href: "/admin/intake/submissions", label: "Submissions" },
];

const EDIT_CONTENT: NavItem[] = [
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/gift-certificates", label: "Gift certificates" },
  { href: "/admin/airports", label: "Airports" },
  { href: "/admin/destinations", label: "Destinations" },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/intake") {
    return (
      pathname === "/admin/intake" ||
      (pathname.startsWith("/admin/intake/") &&
        !pathname.startsWith("/admin/intake/submissions"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Close the dropdown on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const editActive = EDIT_CONTENT.some((i) => isActive(pathname, i.href));

  return (
    <nav className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-4 text-sm font-semibold text-ink-muted">
      {TOP.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors ${
              active ? "text-ink underline-offset-4" : "hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`inline-flex items-center gap-1 transition-colors ${
            editActive ? "text-ink" : "hover:text-ink"
          }`}
        >
          Edit content
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M2 4l3 3 3-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-line bg-canvas p-2 shadow-xl"
          >
            {EDIT_CONTENT.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-ink text-canvas"
                      : "text-ink-muted hover:bg-canvas-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
