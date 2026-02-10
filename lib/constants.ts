/** Replace with owner email for FormSubmit */
export const FORMSUBMIT_EMAIL = "your-email@example.com";

/** Replace with Google Calendar Appointment Schedule link (no double-booking) */
export const GOOGLE_CALENDAR_APPOINTMENT_LINK = "https://calendar.google.com/calendar/appointments/schedules/YOUR_SCHEDULE_ID";

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
