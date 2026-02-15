import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getMinBookingDateStr } from "@/lib/constants";

export const dynamic = "force-dynamic";

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

  const governorateValue = governorate ?? "";

  if (governorateValue !== "cairo") {
    return NextResponse.json(
      { error: "Service available in Cairo only" },
      { status: 403 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  if (date < getMinBookingDateStr()) {
    return NextResponse.json(
      { error: "Booking opens from 25 February" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ booked: true }, { status: 201 });
  }

  const { error } = await supabase.from("appointments").insert({
    date,
    time_slot: timeSlot,
    full_name: fullName,
    phone,
    governorate: governorateValue,
    address_line: addressLine ?? "",
    sub_services: subServices ?? [],
    notes: notes ?? null,
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
