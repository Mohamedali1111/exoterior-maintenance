import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { APPOINTMENT_TIME_SLOTS, isClosedBookingDate } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const servicesParam = request.nextUrl.searchParams.get("services");
  const services = servicesParam
    ? servicesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ taken: [], storage: false }, { status: 200 });
  }

  if (isClosedBookingDate(date)) {
    return NextResponse.json({ taken: [...APPOINTMENT_TIME_SLOTS], storage: true }, { status: 200 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ taken: [], storage: false }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("time_slot, sub_services")
    .eq("date", date);

  if (error) {
    return NextResponse.json({ taken: [], storage: true }, { status: 200 });
  }

  const MAX_BOOKINGS_PER_SERVICE_SLOT = 2;

  // If no service is specified, fall back to global capacity per slot
  if (!services || services.length === 0) {
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const slot = row.time_slot as string;
      counts.set(slot, (counts.get(slot) ?? 0) + 1);
    }
    const taken = Array.from(counts.entries())
      .filter(([, count]) => count >= MAX_BOOKINGS_PER_SERVICE_SLOT)
      .map(([slot]) => slot);
    return NextResponse.json({ taken, storage: true });
  }

  type Row = { time_slot: string; sub_services: string[] | null };
  const perServiceCounts = new Map<string, number>(); // key: `${slot}|${serviceId}`

  for (const raw of data ?? []) {
    const row = raw as Row;
    const slot = row.time_slot;
    const rowServices = Array.isArray(row.sub_services) ? row.sub_services : [];

    // Bookings without services count against all requested services (conservative).
    const affectsAllRequested = rowServices.length === 0;

    for (const serviceId of services) {
      if (affectsAllRequested || rowServices.includes(serviceId)) {
        const key = `${slot}|${serviceId}`;
        perServiceCounts.set(key, (perServiceCounts.get(key) ?? 0) + 1);
      }
    }
  }

  // A slot is taken for the current selection if ANY of the requested services
  // has reached capacity in that slot.
  const takenSet = new Set<string>();
  for (const [key, count] of perServiceCounts.entries()) {
    if (count >= MAX_BOOKINGS_PER_SERVICE_SLOT) {
      const [slot] = key.split("|");
      takenSet.add(slot);
    }
  }

  return NextResponse.json({ taken: Array.from(takenSet), storage: true });
}
