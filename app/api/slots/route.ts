import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ taken: [] }, { status: 200 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ taken: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("time_slot")
    .eq("date", date);

  if (error) {
    return NextResponse.json({ taken: [] }, { status: 200 });
  }

  const taken = (data ?? []).map((r) => r.time_slot as string);
  return NextResponse.json({ taken });
}
