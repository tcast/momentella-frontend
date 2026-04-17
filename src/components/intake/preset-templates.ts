import type { FormField } from "@/lib/intake-schema";

/**
 * Ready-to-drop field templates. Admins pick by plain-English title; we insert
 * a fully-configured field with sensible options. They can still tweak wording
 * afterward in the question card.
 */
export interface PresetTemplate {
  key: string;
  title: string;
  blurb: string;
  build: () => FormField;
}

function fid(): string {
  return `field_${Math.random().toString(36).slice(2, 10)}`;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    key: "home_airport",
    title: "Home airport",
    blurb: "Searchable picker — guests type their city or 3-letter code",
    build: () => ({
      id: fid(),
      type: "airport",
      label: "What airport will you fly from?",
      description: "Start typing a city, airport name, or 3-letter code (e.g. DTW).",
      required: true,
    }),
  },
  {
    key: "destinations",
    title: "Destinations of interest",
    blurb: "Searchable list — pick many (countries, cities, parks…)",
    build: () => ({
      id: fid(),
      type: "destination",
      label: "Where would you like to go?",
      description: "Add as many as you like — we’ll narrow together.",
      allowMultiple: true,
      required: true,
    }),
  },
  {
    key: "single_destination",
    title: "Primary destination",
    blurb: "One main destination from the catalog",
    build: () => ({
      id: fid(),
      type: "destination",
      label: "Primary destination",
      allowMultiple: false,
    }),
  },
  {
    key: "room_pref",
    title: "Room preference",
    blurb: "Separate vs. adjoining vs. suite",
    build: () => ({
      id: fid(),
      type: "select",
      label: "How do you prefer rooms to be arranged?",
      description:
        "We’ll try our best — some properties can’t guarantee connecting rooms.",
      options: [
        { value: "suite", label: "One suite (kids share with parents)" },
        { value: "connecting", label: "Connecting rooms (a door between)" },
        { value: "adjoining", label: "Adjoining rooms (side-by-side)" },
        { value: "separate", label: "Separate rooms anywhere on the floor" },
        { value: "unsure", label: "Not sure — open to suggestions" },
      ],
    }),
  },
  {
    key: "bedding",
    title: "Bedding preferences",
    blurb: "Kings, queens, twins, bunks, crib",
    build: () => ({
      id: fid(),
      type: "multiselect",
      label: "Bedding preferences (pick any that apply)",
      options: [
        { value: "king", label: "King bed for adults" },
        { value: "queen", label: "Queen bed" },
        { value: "two_queens", label: "Two queens / doubles for kids" },
        { value: "bunk_trundle", label: "Bunks or trundle for kids" },
        { value: "rollaway", label: "Rollaway bed" },
        { value: "crib", label: "Crib / pack-n-play" },
        { value: "separate_kids", label: "Kids need their own separate bed" },
      ],
    }),
  },
  {
    key: "pace",
    title: "Travel pace",
    blurb: "Relaxed vs. balanced vs. packed",
    build: () => ({
      id: fid(),
      type: "select",
      label: "What kind of pace fits your family?",
      options: [
        { value: "relaxed", label: "Slow & relaxed — lazy mornings, free time" },
        { value: "balanced", label: "Balanced — a bit of everything" },
        { value: "packed", label: "Packed — we want to see and do a lot" },
      ],
    }),
  },
  {
    key: "dining",
    title: "Dining style",
    blurb: "Fine dining, family-friendly, quick bites…",
    build: () => ({
      id: fid(),
      type: "multiselect",
      label: "How do you like to dine?",
      options: [
        { value: "fine", label: "Fine dining / tasting menus" },
        { value: "family", label: "Family-friendly restaurants" },
        { value: "local", label: "Local & authentic spots" },
        { value: "quick", label: "Quick / casual — on-the-go" },
        { value: "character", label: "Character dining (theme parks)" },
        { value: "room_service", label: "Room service when we need a break" },
        { value: "kitchen", label: "A kitchen in the room for some meals" },
      ],
    }),
  },
  {
    key: "kid_time",
    title: "Kids & kid-free time",
    blurb: "Kids clubs, sitters, adult-only dinners",
    build: () => ({
      id: fid(),
      type: "multiselect",
      label: "What would help the trip work for everyone?",
      options: [
        { value: "kids_club", label: "Kids club at the property" },
        { value: "sitter", label: "In-room sitter / nanny option" },
        { value: "adult_dinner", label: "Adult-only dinners planned in" },
        { value: "teen_hangouts", label: "Teen hangouts / their own activity" },
        { value: "all_together", label: "Mostly all together" },
      ],
    }),
  },
  {
    key: "accessibility",
    title: "Accessibility & mobility",
    blurb: "Strollers, wheelchairs, hearing, vision…",
    build: () => ({
      id: fid(),
      type: "textarea",
      label: "Any accessibility or mobility needs?",
      description:
        "Strollers, wheelchair, scooter, hearing aids, vision, stairs, etc.",
    }),
  },
  {
    key: "dietary",
    title: "Dietary & allergies",
    blurb: "Food allergies, restrictions, preferences",
    build: () => ({
      id: fid(),
      type: "textarea",
      label: "Food allergies or dietary restrictions?",
      description: "List by person if different — we pass this to every vendor.",
    }),
  },
  {
    key: "celebration",
    title: "Celebrating anything special?",
    blurb: "Honeymoon, birthday, anniversary…",
    build: () => ({
      id: fid(),
      type: "select",
      label: "Celebrating anything special?",
      options: [
        { value: "none", label: "No, just a great trip" },
        { value: "honeymoon", label: "Honeymoon" },
        { value: "anniversary", label: "Anniversary" },
        { value: "birthday", label: "Birthday" },
        { value: "graduation", label: "Graduation" },
        { value: "milestone", label: "Milestone reunion / big family" },
        { value: "babymoon", label: "Babymoon" },
      ],
    }),
  },
  {
    key: "budget",
    title: "Budget comfort",
    blurb: "Value, mid-range, luxury, ultra",
    build: () => ({
      id: fid(),
      type: "select",
      label: "What budget feels right?",
      description:
        "Rough total trip cost. Totally OK to say “discuss” — we’ll guide from there.",
      options: [
        { value: "value", label: "Value — best bang for the buck" },
        { value: "mid", label: "Mid-range" },
        { value: "luxury", label: "Luxury" },
        { value: "ultra", label: "Ultra-luxury" },
        { value: "discuss", label: "Prefer to discuss" },
      ],
    }),
  },
  {
    key: "must_haves",
    title: "Must-haves at the property",
    blurb: "Pool, spa, beach, kids club, kitchen, view…",
    build: () => ({
      id: fid(),
      type: "multiselect",
      label: "Must-haves at the hotel or villa",
      options: [
        { value: "pool_kid", label: "Kid-friendly pool" },
        { value: "pool_adult", label: "Adults-only / quiet pool" },
        { value: "beach", label: "Beach access" },
        { value: "all_inclusive", label: "All-inclusive" },
        { value: "spa", label: "Spa on site" },
        { value: "gym", label: "Gym / fitness" },
        { value: "kids_club", label: "Kids club" },
        { value: "golf", label: "Golf on site or nearby" },
        { value: "tennis", label: "Tennis / pickleball" },
        { value: "kitchen", label: "Kitchen / kitchenette in the room" },
        { value: "balcony", label: "Balcony or terrace" },
        { value: "view", label: "Ocean / great view" },
      ],
    }),
  },
  {
    key: "noise",
    title: "Noise sensitivity",
    blurb: "Quiet rooms, high floors",
    build: () => ({
      id: fid(),
      type: "select",
      label: "Any noise sensitivity?",
      options: [
        { value: "none", label: "Any room is fine" },
        { value: "quiet", label: "Away from pool / bar / elevator" },
        { value: "high_floor", label: "High floor preferred" },
      ],
    }),
  },
  {
    key: "trip_length",
    title: "Trip length (nights)",
    blurb: "A simple number",
    build: () => ({
      id: fid(),
      type: "number",
      label: "About how many nights?",
      min: 1,
      max: 60,
    }),
  },
  {
    key: "flexible",
    title: "Date flexibility",
    blurb: "Fixed vs. flexible dates",
    build: () => ({
      id: fid(),
      type: "select",
      label: "How flexible are your dates?",
      options: [
        { value: "fixed", label: "Fixed — we have specific dates" },
        { value: "three", label: "Flexible ± a few days" },
        { value: "week", label: "Flexible by a week" },
        { value: "very", label: "Very flexible — suggest the best time" },
      ],
    }),
  },
  {
    key: "passport",
    title: "Passport status",
    blurb: "Valid, needs renewal, none yet",
    build: () => ({
      id: fid(),
      type: "select",
      label: "Passport status for everyone traveling",
      description: "Most countries require 6 months validity past your return.",
      options: [
        { value: "all_valid", label: "Everyone has a valid passport (6+ months)" },
        { value: "some_renew", label: "Some need renewal soon" },
        { value: "some_new", label: "Some need new passports" },
        { value: "unsure", label: "Not sure yet" },
        { value: "domestic", label: "Domestic trip — not needed" },
      ],
    }),
  },
  {
    key: "insurance",
    title: "Travel insurance",
    blurb: "Include quote or not",
    build: () => ({
      id: fid(),
      type: "select",
      label: "Travel insurance?",
      options: [
        { value: "quote", label: "Please include a quote" },
        { value: "have", label: "Will buy my own / have coverage" },
        { value: "no", label: "Not interested" },
      ],
    }),
  },
  {
    key: "referral",
    title: "How you heard about us",
    blurb: "Referral, social, search…",
    build: () => ({
      id: fid(),
      type: "select",
      label: "How did you hear about us?",
      options: [
        { value: "referral", label: "A friend referred us" },
        { value: "instagram", label: "Instagram" },
        { value: "search", label: "Google / search" },
        { value: "event", label: "Event / in person" },
        { value: "other", label: "Other" },
      ],
    }),
  },
];
