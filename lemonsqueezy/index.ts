import crypto from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

import { db } from "@/db";
import { webhookEvents } from "@/db/schema";
import type { WebhookEvent } from "@/db/schema";

// TYPES

export type LemonSqueezyCustomerMetadata = {
  user_id: string;
};

export type LemonSqueezyEventName =
  | "order_created"
  | "subscription_created"
  | "subscription_payment_success"
  | "subscription_updated"
  | "subscription_expired";

interface MetaBody {
  test_mode: boolean;
  event_name: LemonSqueezyEventName;
  webhook_id: string;
  custom_data: LemonSqueezyCustomerMetadata;
}

export type LemonSqueezyOrderAttributes = {
  data: {
    id: string;
    type: string;
    links: {
      self: string;
    };
    attributes: {
      tax: number;
      urls: {
        receipt: string;
      };
      total: number;
      status: string;
      tax_usd: number;
      currency: string;
      refunded: boolean;
      store_id: number;
      subtotal: number;
      tax_name: string;
      tax_rate: number;
      setup_fee: number;
      test_mode: boolean;
      total_usd: number;
      user_name: string;
      created_at: string;
      identifier: string;
      updated_at: string;
      user_email: string;
      customer_id: number;
      refunded_at: any;
      order_number: number;
      subtotal_usd: number;
      currency_rate: string;
      setup_fee_usd: number;
      tax_formatted: string;
      tax_inclusive: boolean;
      discount_total: number;
      refunded_amount: number;
      total_formatted: string;
      first_order_item: {
        id: number;
        price: number;
        order_id: number;
        price_id: number;
        quantity: number;
        test_mode: boolean;
        created_at: string;
        product_id: number;
        updated_at: string;
        variant_id: number;
        product_name: string;
        variant_name: string;
      };
      status_formatted: string;
      discount_total_usd: number;
      subtotal_formatted: string;
      refunded_amount_usd: number;
      setup_fee_formatted: string;
      discount_total_formatted: string;
      refunded_amount_formatted: string;
    };
  };
  meta: MetaBody;
};

// END TYPES

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function configureLemonSqueezy() {
  const requiredVars = [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required LEMONSQUEEZY env variables: ${missingVars.join(
        ", "
      )}. Please, set them in your .env file.`
    );
  }

  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });
}

export function webhookHasMeta(obj: unknown): obj is { meta: MetaBody } {
  if (
    isObject(obj) &&
    isObject(obj.meta) &&
    typeof obj.meta.event_name === "string" &&
    isObject(obj.meta.custom_data) &&
    //! Make sure to add all the fields you need to the custom data object.
    typeof obj.meta.custom_data.user_id === "string"
  ) {
    return true;
  }
  return false;
}

export function webhookHasData<T>(obj: unknown): obj is T {
  return (
    isObject(obj) &&
    "data" in obj &&
    isObject(obj.data) &&
    "attributes" in obj.data
  );
}

export async function storeWebhookEvent(
  eventName: string,
  body: WebhookEvent["body"]
) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const id = crypto.randomInt(100000000, 1000000000);

  const returnedValue = await db
    .insert(webhookEvents)
    .values({
      id,
      eventName,
      processed: false,
      body,
    })
    .onConflictDoNothing({ target: webhookEvents.id })
    .returning();

  return returnedValue[0];
}
