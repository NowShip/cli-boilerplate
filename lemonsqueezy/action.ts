"use server";

import {
  Order,
  orders,
  plans,
  webhookEvents,
  type WebhookEvent,
} from "@/db/schema";
import {
  configureLemonSqueezy,
  LemonSqueezyOrderAttributes,
  webhookHasData,
} from ".";
import { eq } from "drizzle-orm";
import { db } from "@/db";

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

  if (webhookEvent.eventName.startsWith("subscription_payment_")) {
    // Save subscription invoices; eventBody is a SubscriptionInvoice
    // Not implemented.
  } else if (webhookEvent.eventName.startsWith("subscription_")) {
    // Save subscription events; obj is a Subscription
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
