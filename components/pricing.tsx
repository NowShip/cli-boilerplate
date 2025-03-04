"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useGetUser } from "@/hooks/useGetUser";
import { createCheckout } from "@/lemonsqueezy/action";
import { useGetPlans } from "@/lemonsqueezy/queries";
import { Button } from "./ui/button";
import AuthDialog from "./auth-dialog";

export default function Pricing() {
  const plans = useGetPlans();

  return (
    <div className="mt-8 flex flex-wrap gap-4">
      {plans.data
        ?.sort((a, b) => a.price - b.price)
        ?.filter((plan) => plan.name.toLowerCase() !== "products")
        .map((plan) => (
          <div key={plan.id} className="rounded-2xl border p-4">
            <h2>{plan.name}</h2>
            <p
              dangerouslySetInnerHTML={{
                __html: plan.description || "",
              }}
            />
            <p>{plan.price}</p>
            <CheckoutButton variantId={plan.variantId} />
          </div>
        ))}
    </div>
  );
}

function CheckoutButton({ variantId }: { variantId: number }) {
  const [open, setOpen] = useState(false);

  const { data: user } = useGetUser();

  const createCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("User not found");
      }

      const response = await createCheckout({
        variantId: variantId.toString(),
        userId: user.user.id,
        attributes: {
          productOptions: {
            redirectUrl: window.location.href,
          },
        },
      });

      if (!response.data) {
        throw new Error(response.message || "Failed to create checkout");
      }

      return response.data;
    },
    onSuccess: (data) => {
      window.location.href = data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <AuthDialog open={open} onOpenChange={setOpen}>
      <Button
        className="mt-4 w-full"
        onClick={() => user && createCheckoutMutation.mutate()}
        disabled={createCheckoutMutation.isPending}
      >
        Subscribe
      </Button>
    </AuthDialog>
  );
}
