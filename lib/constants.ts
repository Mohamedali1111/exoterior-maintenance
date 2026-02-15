/** Email where booking requests are sent (FormSubmit). Set in .env.local / Vercel: NEXT_PUBLIC_FORMSUBMIT_EMAIL */
export const FORMSUBMIT_EMAIL =
  typeof process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL === "string" && process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL.length > 0
    ? process.env.NEXT_PUBLIC_FORMSUBMIT_EMAIL
    : "your-email@example.com";

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

/** Appointment time slots: 1 hour each, 9:00–16:00. Format HH:mm = start of 1-hour block. */
export const APPOINTMENT_TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
] as const;
export type AppointmentTimeSlot = (typeof APPOINTMENT_TIME_SLOTS)[number];

/** Returns end time for a slot (1 hour later). e.g. "09:00" -> "10:00" */
export function slotEndTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const end = (h + 1) * 60 + (m || 0);
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`;
}

/** How many days ahead users can book (from min date). */
export const APPOINTMENT_DAYS_AHEAD = 60;

/** First bookable date in 2025 and 2026 (calendar locked before this in those years). */
const BOOKING_START_2025 = "2025-02-25";
const BOOKING_START_2026 = "2026-02-25";

/** Booking opens from 25 Feb in 2025 and 2026; from 2027 onward, booking is available from today. Returns min date as YYYY-MM-DD (local date). */
export function getMinBookingDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();   // 0 = Jan, 1 = Feb
  const d = now.getDate();
  const today = `${y}-${(m + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;

  if (y >= 2027) return today;
  if (y < 2025) return BOOKING_START_2025;
  if (y === 2026) {
    if (m > 1 || (m === 1 && d >= 25)) return today;
    return BOOKING_START_2026;
  }
  // 2025: allow from 25 Feb onward
  if (m > 1 || (m === 1 && d >= 25)) return today;
  return BOOKING_START_2025;
}

/** Service area: only Cairo is currently served. */
export const SERVICE_AREA_CAIRO = "cairo";
export const SERVICE_AREA_OTHER = "other";
export const SERVICE_AREAS = [SERVICE_AREA_CAIRO, SERVICE_AREA_OTHER] as const;
