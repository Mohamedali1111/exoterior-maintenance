import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getMinBookingDateStr, APPOINTMENT_TIME_SLOTS, EGYPT_PHONE_REGEX } from "@/lib/constants";
import { MAIN_SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";

/** Reasonable max lengths to prevent abuse (not for XSS – React escapes; for storage/DoS). */
const MAX_FULL_NAME = 200;
const MAX_ADDRESS = 500;
const MAX_NOTES = 2000;

type Body = {
  date?: string;
  timeSlot?: string;
  fullName?: string;
  phone?: string;
  governorate?: string;
  addressLine?: string;
  subServices?: string[];
  notes?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    date,
    timeSlot,
    fullName,
    phone,
    governorate,
    addressLine,
    subServices,
    notes,
  } = body;

  if (
    !date ||
    !timeSlot ||
    !fullName ||
    !phone ||
    addressLine === undefined
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (date < getMinBookingDateStr()) {
    return NextResponse.json(
      { error: "Please choose today or a future date" },
      { status: 400 }
    );
  }

  const allowedSlots: string[] = [...APPOINTMENT_TIME_SLOTS];
  if (!allowedSlots.includes(timeSlot)) {
    return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
  }

  const phoneClean = String(phone).replace(/\s/g, "");
  if (!EGYPT_PHONE_REGEX.test(phoneClean)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const fullNameStr = String(fullName);
  const addressLineStr = String(addressLine ?? "");
  if (fullNameStr.length > MAX_FULL_NAME || addressLineStr.length > MAX_ADDRESS) {
    return NextResponse.json({ error: "Field too long" }, { status: 400 });
  }

  const notesStr = notes == null ? "" : String(notes);
  if (notesStr.length > MAX_NOTES) {
    return NextResponse.json({ error: "Notes too long" }, { status: 400 });
  }

  const subServicesSafe = Array.isArray(subServices)
    ? (subServices as string[]).filter((s) => typeof s === "string" && MAIN_SERVICES.includes(s as never))
    : [];

  const governorateValue = governorate ?? "";

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ booked: true }, { status: 201 });
  }

  const { error } = await supabase.from("appointments").insert({
    date,
    time_slot: timeSlot,
    full_name: fullNameStr.slice(0, MAX_FULL_NAME),
    phone: phoneClean,
    governorate: governorateValue,
    address_line: addressLineStr.slice(0, MAX_ADDRESS),
    sub_services: subServicesSafe,
    notes: notesStr.length > 0 ? notesStr.slice(0, MAX_NOTES) : null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Slot already booked", conflict: true },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to book" },
      { status: 500 }
    );
  }

  return NextResponse.json({ booked: true }, { status: 201 });
}
