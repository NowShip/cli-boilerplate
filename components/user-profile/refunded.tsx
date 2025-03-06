import {
  UsersIcon,
  AlertTriangleIcon,
  ImageIcon,
  CircleAlertIcon,
} from "lucide-react";

import { Button } from "../ui/button";
import { useCreateOrder, useGetPlans } from "@/lemonsqueezy/queries";

export default function Refunded() {
  const createOrder = useCreateOrder();
  const plans = useGetPlans();

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
        <div className="flex gap-3">
          <CircleAlertIcon
            className="mt-0.5 shrink-0 opacity-60"
            size={16}
            aria-hidden="true"
          />
          <div className="grow space-y-1">
            <p className="text-sm font-medium">Payment Refunded</p>
            <p className="text-muted-foreground text-sm">
              Your payment has been refunded. Premium features are no longer
              available.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg border px-4 py-3">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">
            Would you like to reactivate your premium access?
          </p>
          {plans.data?.map((plan) => (
            <Button
              key={plan.id}
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => createOrder.mutate({ variantId: plan.variantId })}
              disabled={createOrder.isPending}
            >
              Get full access again
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border px-3 py-2">
        <div className="grid gap-y-1">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <AlertTriangleIcon className="h-3.5 w-3.5 text-gray-400" />
            Limited to basic features
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
            Watermarks on exports
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
            Limited users and storage
          </div>
        </div>
      </div>
    </div>
  );
}
