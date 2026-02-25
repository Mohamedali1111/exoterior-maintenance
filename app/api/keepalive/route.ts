import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Keep-alive endpoint for Supabase free tier.
 * Supabase pauses projects after 7 days of inactivity. Call this URL every 5–6 days
 * (e.g. with cron-job.org, UptimeRobot, or Vercel Cron) so Supabase sees activity
 * and does not pause your project.
 *
 * Optional: set CRON_SECRET in env and send it as Authorization: Bearer <CRON_SECRET>
 * so only your cron job can trigger this.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ ok: true, supabase: false }, { status: 200 });
  }

  try {
    await supabase.from("appointments").select("id").limit(1);
  } catch {
    return NextResponse.json({ ok: true, supabase: "error" }, { status: 200 });
  }

  return NextResponse.json({ ok: true, supabase: true }, { status: 200 });
}
