// supabase/functions/log-watch-event/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.36.0";

interface WatchEvent {
  mediaId: string;
  watchedSeconds: number;
  completed: boolean;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" }});
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Expected application/json" }), { status: 415, headers: { "Content-Type": "application/json" }});
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    let events: WatchEvent[] = [];

    // Accept single event or batch array
    if (body.mediaId && typeof body.watchedSeconds !== "undefined" && typeof body.completed !== "undefined") {
      events.push({
        mediaId: String(body.mediaId),
        watchedSeconds: Number(body.watchedSeconds),
        completed: Boolean(body.completed)
      });
    } else if (Array.isArray(body.events)) {
      events = body.events.map((e: { mediaId?: unknown; watchedSeconds?: unknown; completed?: unknown }) => ({
        mediaId: String(e.mediaId),
        watchedSeconds: Number(e.watchedSeconds),
        completed: Boolean(e.completed)
      }));
    } else {
      return new Response(JSON.stringify({ error: "Invalid payload shape; expected { mediaId, watchedSeconds, completed } or { events: [...] }" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const results: { mediaId?: string; status: "ok" | "error"; error?: string }[] = [];

    for (const ev of events) {
      // Basic validation
      if (!ev.mediaId || Number.isNaN(ev.watchedSeconds)) {
        results.push({ mediaId: ev.mediaId, status: "error", error: "Invalid fields" });
        continue;
      }

      // Call the RPC using Service Role
      const { error } = await supabase.rpc("log_watch_event", {
        p_media_id: ev.mediaId,
        p_seconds: ev.watchedSeconds,
        p_completed: ev.completed
      });

      if (error) {
        results.push({ mediaId: ev.mediaId, status: "error", error: error.message ?? String(error) });
      } else {
        results.push({ mediaId: ev.mediaId, status: "ok" });
      }
    }

    return new Response(JSON.stringify({ results }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
});
