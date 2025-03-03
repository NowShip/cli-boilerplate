import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";
import {
  getProduct,
  listPrices,
  listProducts,
  Variant,
} from "@lemonsqueezy/lemonsqueezy.js";

import { configureLemonSqueezy } from "@/lemonsqueezy";
import { plans } from "./schema";

export const db = drizzle(process.env.DATABASE_URL as string);

async function storePlans() {
  configureLemonSqueezy();

  const products = await listProducts({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
    include: ["variants"],
  });

  // Loop through all the variants.
  const allVariants = products.data?.included as Variant["data"][] | undefined;

  if (allVariants) {
    for (const v of allVariants) {
      const variant = v.attributes;

      // Skip draft variants or if there's more than one variant, skip the default
      // variant. See https://docs.lemonsqueezy.com/api/variants
      if (
        variant.status === "draft" ||
        (allVariants.length !== 1 && variant.status === "pending")
      ) {
        // `return` exits the function entirely, not just the current iteration.
        continue;
      }

      console.log("variant", variant);

      // Fetch the Product name.
      const productName =
        (await getProduct(variant.product_id)).data?.data.attributes.name ?? "";

      // Fetch the Price object.
      const variantPriceObject = await listPrices({
        filter: {
          variantId: v.id,
        },
      });

      const currentPriceObj = variantPriceObject.data?.data.at(0);
      const isUsageBased =
        currentPriceObj?.attributes.usage_aggregation !== null;
      const interval = currentPriceObj?.attributes.renewal_interval_unit;
      const intervalCount =
        currentPriceObj?.attributes.renewal_interval_quantity;
      const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
      const trialIntervalCount =
        currentPriceObj?.attributes.trial_interval_quantity;

      const price = isUsageBased
        ? currentPriceObj?.attributes.unit_price_decimal
        : currentPriceObj.attributes.unit_price;

      const priceString = price !== null ? (price?.toString() ?? "") : "";

      await db
        .insert(plans)
        .values({
          name: variant.name,
          description: variant.description,
          price: Number(priceString),
          interval,
          intervalCount,
          isUsageBased,
          productId: variant.product_id,
          productName,
          variantId: parseInt(v.id) as unknown as number,
          trialInterval,
          trialIntervalCount,
          sort: variant.sort,
        })
        .onConflictDoUpdate({
          target: plans.variantId,
          set: {
            name: variant.name,
            description: variant.description,
            price: Number(priceString),
            interval,
            intervalCount,
            isUsageBased,
            productId: variant.product_id,
            productName,
            trialInterval,
            trialIntervalCount,
            sort: variant.sort,
          },
        });
    }
  }
  console.log("New plan created!");
}

// storePlans();
