"use server";

import axios, { AxiosError } from "axios";
import { NewCheckout } from "@lemonsqueezy/lemonsqueezy.js";

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";

import {
  Order,
  orders,
  plans,
  webhookEvents,
  type WebhookEvent,
} from "@/db/schema";
import {
  configureLemonSqueezy,
  webhookHasData,
  type LemonSqueezyCheckoutBody,
  type LemonSqueezyCustomerMetadata,
  type LemonSqueezyError,
  type LemonSqueezyOrderAttributes,
  type LemonSqueezySubscriptionAttributes,
} from ".";
import { convertKeysToSnakeCase } from "@/lib/utils";

export const paymentApi = axios.create({
  baseURL: `https://api.lemonsqueezy.com/v1`,
  headers: {
    accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  },
});

export async function processWebhookEvent(webhookEvent: WebhookEvent) {
  configureLemonSqueezy();

  const dbWebhookEvent = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, webhookEvent.id));

  if (dbWebhookEvent.length < 1) {
    throw new Error(
      `Webhook event #${webhookEvent.id} not found in the database.`
    );
  }

  let processingError = "";
  const eventBody = webhookEvent.body;

  if (
    webhookEvent.eventName.startsWith("subscription_") &&
    webhookHasData<LemonSqueezySubscriptionAttributes>(eventBody)
  ) {
    //  No need to process subscription events.
  } else if (
    webhookEvent.eventName.startsWith("order_") &&
    webhookHasData<LemonSqueezyOrderAttributes>(eventBody)
  ) {
    const attributes = eventBody.data.attributes;
    const meta = eventBody.meta;

    const variantId = attributes.first_order_item.variant_id;

    // We assume that the Plan table is up to date.
    const [plan] = await db
      .select()
      .from(plans)
      .where(eq(plans.variantId, parseInt(variantId.toString(), 10)));

    if (!plan) {
      processingError = `Plan #${variantId} not found in the database.`;
    } else {
      const updateData: Order = {
        orderId: eventBody.data.id,
        name: attributes.user_name,
        email: attributes.user_email,
        status: attributes.status,
        variantId: plan.variantId,
        // ! Make sure to set this to the product name.
        productName: "",
        userId: meta.custom_data.user_id,
        createdAt: new Date(attributes.created_at),
        updatedAt: new Date(attributes.updated_at),
        refunded: attributes.refunded as boolean,
      };

      try {
        await db.insert(orders).values(updateData).onConflictDoUpdate({
          target: orders.orderId,
          set: updateData,
        });
      } catch (error) {
        processingError = `Failed to upsert Order #${updateData.orderId} to the database. ${error}`;
      }
    }
  } else if (webhookEvent.eventName.startsWith("license_")) {
    // Save license keys; eventBody is a "License key"
    /* Not implemented */
  }

  // Update the webhook event in the database.
  await db
    .update(webhookEvents)
    .set({
      processed: true,
      processingError,
    })
    .where(eq(webhookEvents.id, webhookEvent.id));
}

export async function createCheckout({
  variantId,
  userId,
  attributes,
  customData,
}: {
  variantId: string;
  userId: string;
  attributes?: NewCheckout;
  customData?: LemonSqueezyCustomerMetadata;
}): Promise<ServerResponse<string>> {
  try {
    if (!process.env.LEMONSQUEEZY_STORE_ID || !variantId || !userId) {
      throw new Error(
        `Missing required fields: ${!process.env.LEMONSQUEEZY_STORE_ID ? "LEMONSQUEEZY_STORE_ID, " : ""}${!variantId ? "variantId, " : ""}${!userId ? "userId" : ""}`
      );
    }

    const bodyValue: LemonSqueezyCheckoutBody = {
      data: {
        type: "checkouts",
        attributes: {
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          productOptions: {
            enabledVariants: [Number(variantId)],
            receiptButtonText: "Go to website",
            ...attributes?.productOptions,
          },
          checkoutData: {
            custom: {
              user_id: userId,
              ...customData,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              id: variantId,
              type: "variants",
            },
          },
        },
      },
    };

    const { data } = await paymentApi.post(
      `/checkouts`,
      convertKeysToSnakeCase(bodyValue)
    );

    return {
      data: data.data.attributes.url,
    };
  } catch (error) {
    const err = error as AxiosError<LemonSqueezyError>;

    console.log(err.response?.data);

    return {
      message: err.response?.data.errors[0].detail || "Error",
    };
  }
}

export async function getUserOrder(
  userId: string
): Promise<ServerResponse<Order>> {
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.id))
      .limit(1)
      .then((rows) => rows[0]);

    return {
      data: order,
    };
  } catch (error) {
    const err = error as Error;

    return {
      message: err.message || "Error",
    };
  }
}

export async function getCustomerPortalUrl(
  subscriptionId: string
): Promise<ServerResponse<string>> {
  try {
    if (!subscriptionId) {
      return {
        message: "Subscription ID is required",
      };
    }

    const { data } = await paymentApi.get(`/subscriptions/${subscriptionId}`);

    return {
      data: data.data.attributes.urls.customer_portal,
    };
  } catch (error) {
    const err = error as AxiosError<LemonSqueezyError>;

    return {
      message: err.response?.data.errors[0].detail || "Error",
    };
  }
}
