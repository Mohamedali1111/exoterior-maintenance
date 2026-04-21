/** Logo path. Bump the query (e.g. ?v=3) when you replace Logo.png so all browsers load the new image. */
export const LOGO_SRC = "/Logo.png?v=2";

/** Hero video cache bust. Bump (e.g. ?v=3) when you replace public/videos/hero-bg.mp4 so all browsers load the new video. */
export const HERO_VIDEO_VERSION = "2";

/** Email where booking requests are sent (FormSubmit). Set in .env.local / Vercel: NEXT_PUBLIC_FORMSUBMIT_EMAIL */
export const FORMSUBMIT_EMAIL =
  typeof process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL === "string" && process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL.length > 0
    ? process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL
    : "your-email@example.com";

/** Optional second recipient (e.g. Mohamed Ali). Set NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY to also send form to this address. */
export const FORMSUBMIT_EMAIL_SECONDARY =
  typeof process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY === "string" &&
  process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY.length > 0
    ? process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL_SECONDARY
    : null;

function parseFormSubmitExtraEmails(raw: string | undefined): string[] {
  if (!raw || typeof raw !== "string") return [];
  return raw
    .split(/[,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

/**
 * Extra FormSubmit recipients (same booking email as primary). Comma-separated in env.
 * Vercel: Project → Settings → Environment Variables → `NEXT_PUBLIC_FORMSUBMIT_EMAIL_EXTRA`
 */
export const FORMSUBMIT_EMAIL_EXTRA = parseFormSubmitExtraEmails(
  typeof process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL_EXTRA === "string"
    ? process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL_EXTRA
    : undefined
);

/** Egypt mobile: 01 + 9 digits */
export const EGYPT_PHONE_REGEX = /^01[0-9]{9}$/;

/** Appointment time slots: 1 hour each, 10:00–21:00 (10 AM–9 PM start, last slot ends 10 PM). Format HH:mm = start of 1-hour block. */
export const APPOINTMENT_TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
] as const;
export type AppointmentTimeSlot = (typeof APPOINTMENT_TIME_SLOTS)[number];

/** Official launch date for bookings (YYYY-MM-DD). Before this, users can only book from this date onwards. */
export const APPOINTMENT_LAUNCH_DATE = "2026-04-01";
export const APPOINTMENT_BLOCKED_RANGES = [
  { start: "2026-04-21", end: "2026-04-26" },
] as const;

/** Returns end time for a slot (1 hour later). e.g. "12:00" -> "13:00" */
export function slotEndTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const end = (h + 1) * 60 + (m || 0);
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
}

/** Human-friendly label for a slot (e.g. "12:00" -> "12 PM", "21:00" -> "9 PM") for easy reading. */
export function formatSlotLabel(slot: string): string {
  const [h] = slot.split(":").map(Number);
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

/** How many days ahead users can book (from min date). */
export const APPOINTMENT_DAYS_AHEAD = 60;

/** True if this calendar day is Friday (local). `dateStr` must be YYYY-MM-DD. */
export function isFridayClosedDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return new Date(`${dateStr}T12:00:00`).getDay() === 5;
}

/** True if the date falls inside any blocked range (inclusive). */
export function isBlockedRangeDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  return APPOINTMENT_BLOCKED_RANGES.some((r) => dateStr >= r.start && dateStr <= r.end);
}

/** Any closed booking date (weekly closures + temporary blocked ranges). */
export function isClosedBookingDate(dateStr: string): boolean {
  return isFridayClosedDate(dateStr) || isBlockedRangeDate(dateStr);
}

/**
 * First bookable date.
 * - Before launch: minimum is the launch date (APPOINTMENT_LAUNCH_DATE).
 * - After launch: minimum is "today" so users can't book in the past.
 * - Closed days are skipped (Fridays + blocked ranges).
 * Returns YYYY-MM-DD in local time.
 */
export function getMinBookingDateStr(): string {
  const launch = new Date(`${APPOINTMENT_LAUNCH_DATE}T12:00:00`);
  let base = new Date();
  base.setHours(12, 0, 0, 0);
  if (base < launch) base = new Date(launch);
  while (isClosedBookingDate(`${base.getFullYear()}-${(base.getMonth() + 1).toString().padStart(2, "0")}-${base.getDate().toString().padStart(2, "0")}`)) {
    base.setDate(base.getDate() + 1);
  }
  const y = base.getFullYear();
  const m = base.getMonth();
  const d = base.getDate();
  return `${y}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}
