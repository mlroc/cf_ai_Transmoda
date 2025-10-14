import { NextRequest } from "next/server";
import { config } from "@/lib/config";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstreamUrl = `${config.api.baseUrl}${config.api.endpoints.reformat}?sid=web`;
    const res = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ct = res.headers.get("content-type") || "";
    const text = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: text || `Upstream ${res.status}` }), {
        status: 502,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      });
    }
    if (ct.includes("application/json")) {
      return new Response(text, { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    // If upstream responded with plain text, coerce to expected JSON shape
    if (text && text !== "OK") {
      return new Response(JSON.stringify({ content: text }), { status: 200, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    }
    return new Response(JSON.stringify({ error: "Upstream returned an unexpected response" }), { status: 502, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  } catch {
    return new Response(JSON.stringify({ error: "Proxy error" }), { status: 500 });
  }
}


