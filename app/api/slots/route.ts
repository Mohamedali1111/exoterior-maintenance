import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ taken: [], storage: false }, { status: 200 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ taken: [], storage: false }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("time_slot")
    .eq("date", date);

  if (error) {
    return NextResponse.json({ taken: [], storage: true }, { status: 200 });
  }

  const MAX_BOOKINGS_PER_SLOT = 2;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const slot = row.time_slot as string;
    counts.set(slot, (counts.get(slot) ?? 0) + 1);
  }
  // A slot is considered "taken" only when it has reached capacity
  const taken = Array.from(counts.entries())
    .filter(([, count]) => count >= MAX_BOOKINGS_PER_SLOT)
    .map(([slot]) => slot);

  return NextResponse.json({ taken, storage: true });
}
