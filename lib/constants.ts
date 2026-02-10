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

/** How many days ahead users can book (from today). */
export const APPOINTMENT_DAYS_AHEAD = 60;
