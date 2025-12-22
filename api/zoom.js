import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  // Soportar body como objeto o como string
  let data = req.body;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch (e) { data = {}; }
  }

  // 1) Validación Zoom
  if (data?.event === "endpoint.url_validation") {
    const plainToken = String(data?.payload?.plainToken || "").trim();
    const secret = String(process.env.ZOOM_WEBHOOK_SECRET || "").trim();

    const encryptedToken = crypto
      .createHmac("sha256", secret)
      .update(plainToken)
      .digest("hex");

    return res.status(200).json({ plainToken, encryptedToken });
  }

  // 2) Reenvío a Apps Script (opcional)
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        redirect: "follow",
      });
    } catch (e) {
      // No bloquees Zoom
    }
  }

  return res.status(200).json({ ok: true });
}
