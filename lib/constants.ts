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

/** Egypt mobile: 01 + 9 digits */
export const EGYPT_PHONE_REGEX = /^01[0-9]{9}$/;

/** Egypt governorates – IDs match booking.governorates.* in messages */
export const GOVERNORATE_IDS = [
  "cairo", "giza", "alexandria", "dakahlia", "red_sea", "beheira", "fayoum", "gharbia",
  "ismailia", "menoufia", "minya", "qalyubia", "qena", "sohag", "beni_suef", "aswan", "asyut",
  "damietta", "kafr_el_sheikh", "luxor", "matrouh", "new_valley", "north_sinai", "port_said",
  "south_sinai", "suez",
] as const;
export type GovernorateId = (typeof GOVERNORATE_IDS)[number];

/** Appointment time slots: 1 hour each, 12:00–21:00 (12 PM–9 PM start, last slot ends 10 PM). Format HH:mm = start of 1-hour block. */
export const APPOINTMENT_TIME_SLOTS = [
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
] as const;
export type AppointmentTimeSlot = (typeof APPOINTMENT_TIME_SLOTS)[number];

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

/** First bookable date is today. Returns min date as YYYY-MM-DD (local date). */
export function getMinBookingDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  return `${y}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}
