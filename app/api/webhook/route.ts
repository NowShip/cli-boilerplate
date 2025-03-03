import crypto from "node:crypto";
import { webhookHasMeta, storeWebhookEvent } from "@/lemonsqueezy";
import { processWebhookEvent } from "@/lemonsqueezy/action";

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    });
  }

  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = Buffer.from(
    request.headers.get("X-Signature") ?? "",
    "hex"
  );
  const hmac = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  );

  if (!crypto.timingSafeEqual(hmac, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let data: unknown;

  try {
    data = JSON.parse(rawBody);
  } catch (error) {
    console.error(error);
    return new Response("Invalid JSON payload", { status: 400 });
  }

  // Type guard to check if the object has a 'meta' property.
  if (webhookHasMeta(data)) {
    const webhookEvent = await storeWebhookEvent(data.meta.event_name, data);

    if (webhookHasMeta(webhookEvent.body)) {
      await processWebhookEvent(webhookEvent);
      return new Response("OK", { status: 200 });
    } else {
      return new Response(
        "Invalid webhook payload format: Stored webhook event body is missing required 'meta' property with event metadata",
        { status: 400 }
      );
    }
  } else {
    return new Response(
      "Invalid webhook payload format: The payload is missing the required 'meta' property with event metadata",
      { status: 400 }
    );
  }
}
