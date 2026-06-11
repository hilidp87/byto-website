export async function register() {
  // Only run in the Node.js runtime (not during the Edge/build phase)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : null;

  if (!APP_URL) {
    console.log("[keep-alive] No APP_URL configured — skipping self-ping setup.");
    return;
  }

  const pingUrl = `${APP_URL}/api/health`;
  console.log(`[keep-alive] Self-ping every 5 min → ${pingUrl}`);

  // Wait 30 s after boot before first ping so the server is fully ready
  setTimeout(() => {
    ping();
    setInterval(ping, INTERVAL_MS);
  }, 30_000);

  async function ping() {
    try {
      const res = await fetch(pingUrl, { cache: "no-store" });
      console.log(`[keep-alive] ping ${res.ok ? "ok" : `failed (${res.status})`}`);
    } catch (err) {
      console.error("[keep-alive] ping error:", err);
    }
  }
}
