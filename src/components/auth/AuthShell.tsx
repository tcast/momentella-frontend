import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[70vh] bg-canvas px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-wide text-ink"
        >
          Momentella
        </Link>
        <h1 className="mt-8 font-display text-3xl font-medium text-ink">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
        ) : null}
        <div className="mt-8 rounded-2xl border border-line bg-canvas-muted/50 p-6 shadow-[0_2px_0_rgba(28,25,23,0.04)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
