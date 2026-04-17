import Link from "next/link";
import { notFound } from "next/navigation";
import { IntakeResponseView } from "@/components/intake/IntakeResponseView";
import { IntakeSubmissionActions } from "@/components/intake/IntakeSubmissionActions";
import { SubmissionNotesEditor } from "@/components/intake/SubmissionNotesEditor";
import type { IntakeFormSchema } from "@/lib/intake-schema";
import { serverFetchJson } from "@/lib/server-fetch";

export const dynamic = "force-dynamic";

type SubmissionDetail = {
  submission: {
    id: string;
    email: string;
    status: string;
    responses: Record<string, unknown>;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    form: { id: string; name: string; slug: string };
    formVersion: { version: number; label: string | null };
    client: { id: string; email: string; name: string } | null;
  };
  schema: IntakeFormSchema | null;
};

export default async function IntakeSubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const data = await serverFetchJson<SubmissionDetail>(
    `/api/admin/intake-submissions/${submissionId}`,
  );
  if (!data?.submission) notFound();
  const { submission, schema } = data;
  const responses =
    submission.responses &&
    typeof submission.responses === "object" &&
    !Array.isArray(submission.responses)
      ? (submission.responses as Record<string, unknown>)
      : {};

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/intake/submissions"
          className="text-sm font-semibold text-accent hover:underline"
        >
          ← All submissions
        </Link>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
          Intake submission
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {new Date(submission.createdAt).toLocaleString()} · {submission.email}
        </p>
        <p className="text-sm text-ink-muted">
          Form:{" "}
          <Link
            href={`/admin/intake/${submission.form.id}`}
            className="font-semibold text-accent hover:underline"
          >
            {submission.form.name}
          </Link>{" "}
          · v{submission.formVersion.version}
          {submission.formVersion.label
            ? ` (${submission.formVersion.label})`
            : ""}
        </p>
        {submission.client ? (
          <p className="mt-1 text-sm text-ink-muted">
            Linked account: {submission.client.name} ({submission.client.email})
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold uppercase text-ink-muted">
            Status
          </span>
          <IntakeSubmissionActions id={submission.id} status={submission.status} />
        </div>
      </div>

      <SubmissionNotesEditor
        submissionId={submission.id}
        initialNotes={submission.notes}
      />

      <section>
        <h3 className="font-display text-lg font-semibold text-ink">Responses</h3>
        <div className="mt-4">
          <IntakeResponseView schema={schema} responses={responses} />
        </div>
      </section>
    </div>
  );
}
