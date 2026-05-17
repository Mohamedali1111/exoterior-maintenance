import { FORMSUBMIT_EMAIL, FORMSUBMIT_EMAIL_CONFIGURED } from "@/lib/constants";

export type BookingNotification = {
  subject: string;
  fullName: string;
  phone: string;
  address: string;
  services: string;
  notes: string;
  appointmentDate: string;
  appointmentTime: string;
};

/** Web3Forms (recommended): free, works from server. Get key at https://web3forms.com */
async function sendViaWeb3Forms(data: BookingNotification): Promise<boolean> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) return false;

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: data.subject,
        from_name: "Exoterior Booking",
        name: data.fullName,
        phone: data.phone,
        address: data.address,
        services: data.services,
        notes: data.notes,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const result = (await response.json()) as { success?: boolean };
    return response.ok && result.success === true;
  } catch (err) {
    console.error("Web3Forms error:", err);
    return false;
  }
}

/** FormSubmit fallback (often down or slow – keep as backup only). */
async function sendViaFormSubmit(data: BookingNotification): Promise<boolean> {
  if (!FORMSUBMIT_EMAIL_CONFIGURED) return false;

  try {
    const response = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(FORMSUBMIT_EMAIL.trim())}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: data.subject,
          _captcha: "false",
          _template: "table",
          "Full name": data.fullName,
          Phone: data.phone,
          Address: data.address,
          Services: data.services,
          "Problem / description": data.notes,
          "Appointment date": data.appointmentDate,
          "Appointment time": data.appointmentTime,
        }),
        signal: AbortSignal.timeout(20_000),
      }
    );
    return response.ok;
  } catch (err) {
    console.error("FormSubmit error:", err);
    return false;
  }
}

/** Sends booking notification email. Tries Web3Forms first, then FormSubmit. */
export async function sendBookingNotification(data: BookingNotification): Promise<boolean> {
  if (await sendViaWeb3Forms(data)) return true;
  if (await sendViaFormSubmit(data)) return true;
  return false;
}
