"use client";

import React, { useState } from "react";
import {
  useCreateOrder,
  useGetPlans,
  useGetUserOrder,
} from "@/lemonsqueezy/queries";

import { useGetUser } from "@/hooks/useGetUser";
import { Button } from "./ui/button";
import AuthDialog from "./auth-dialog";
import { formatPrice } from "@/lib/utils";

export default function Pricing() {
  const plans = useGetPlans();
  const userOrder = useGetUserOrder();

  if (userOrder.data?.status === "paid") return null;

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      {plans.data
        ?.sort((a, b) => a.price - b.price)
        ?.filter((plan) => plan.name.toLowerCase() !== "products")
        .map((plan) => (
          <div key={plan.id} className="w-full rounded-2xl border p-4">
            <h2>{plan.name}</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: plan.description || "",
              }}
            />
            <p>{formatPrice(plan.price)}</p>
            <CheckoutButton variantId={plan.variantId} />
          </div>
        ))}
    </div>
  );
}

function CheckoutButton({ variantId }: { variantId: number }) {
  const [open, setOpen] = useState(false);

  const { data: user } = useGetUser();

  const createCheckoutMutation = useCreateOrder();

  return (
    <AuthDialog open={open} onOpenChange={setOpen}>
      <Button
        className="mt-4 w-full"
        onClick={() =>
          user &&
          createCheckoutMutation.mutate({ variantId: variantId.toString() })
        }
        disabled={createCheckoutMutation.isPending}
      >
        Get full access
      </Button>
    </AuthDialog>
  );
}
