import { SparklesIcon } from "lucide-react";
import { useCreateOrder, useGetPlans } from "@/lemonsqueezy/queries";
import { Button } from "../ui/button";
import { formatPrice } from "@/lib/utils";

export default function GetFullAccess() {
  const plans = useGetPlans();
  const createOrder = useCreateOrder();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-purple-500/40 bg-gradient-to-b from-purple-50 to-purple-100/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <SparklesIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Unlock Premium Features</h3>
            <p className="text-muted-foreground text-sm">
              Take your experience to the next level with premium access
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Create unlimited projects
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Remove watermarks
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="h-4 w-4 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Advanced features
          </div>
        </div>
      </div>

      {plans.data?.map((plan) => (
        <Button
          key={plan.id}
          className="relative w-full overflow-hidden"
          onClick={() =>
            createOrder.mutate({
              variantId: plan.variantId,
            })
          }
          disabled={createOrder.isPending}
        >
          Get full access
          {plan.price > 0 && ` - ${formatPrice(plan.price)}`}
        </Button>
      ))}
    </div>
  );
}
