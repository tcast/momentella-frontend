/** Mirrors backend `proposal-schema.ts`. */

import type { ItinerarySchema } from "./itinerary-schema";

export const PROPOSAL_SCHEMA_VERSION = 1 as const;

export interface ProposalTripSnapshot {
  title: string;
  kind: string;
  status: string;
  destination: string | null;
  destinations: unknown[] | null;
  startsOn: string | null;
  endsOn: string | null;
  homeAirportIata: string | null;
  partyAdults: number | null;
  partyChildren: number | null;
  partyChildAges: number[] | null;
  budgetTier: string | null;
  summary: string | null;
}

export interface ProposalSchema {
  version: typeof PROPOSAL_SCHEMA_VERSION;
  trip: ProposalTripSnapshot;
  itinerary: ItinerarySchema;
}

export function parseProposalSchema(raw: unknown): ProposalSchema | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.version !== PROPOSAL_SCHEMA_VERSION) return null;
  if (!o.trip || typeof o.trip !== "object") return null;
  if (!o.itinerary || typeof o.itinerary !== "object") return null;
  return o as unknown as ProposalSchema;
}

export const PROPOSAL_STATUS_LABEL: Record<string, string> = {
  SENT: "Awaiting your review",
  APPROVED: "Approved",
  CHANGES_REQUESTED: "Changes requested",
  WITHDRAWN: "Withdrawn",
};

export const PROPOSAL_STATUS_COLOR: Record<string, string> = {
  SENT: "bg-amber-100 text-amber-900",
  APPROVED: "bg-emerald-100 text-emerald-900",
  CHANGES_REQUESTED: "bg-violet-100 text-violet-900",
  WITHDRAWN: "bg-stone-200 text-stone-800",
};
