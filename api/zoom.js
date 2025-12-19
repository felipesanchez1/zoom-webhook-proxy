import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const data = req.body;

  // 1) Validación de Zoom (endpoint.url_validation)
  if (data?.event === "endpoint.url_validation") {
    const plainToken = data?.payload?.plainToken || "";
    const secret = process.env.ZOOM_WEBHOOK_SECRET || "";

    const encryptedToken = crypto
      .createHmac("sha256", secret)
      .update(plainToken)
      .digest("hex");

    return res.status(200).json({ plainToken, encryptedToken });
  }

  // 2) Reenvío a Apps Script
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;

  try {
    await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      redirect: "follow"
    });
  } catch (e) {
    // No bloqueamos a Zoom si falla el reenvío
  }

  return res.status(200).json({ ok: true });
}
