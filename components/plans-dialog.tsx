"use client";

import { useState } from "react";
import { CheckIcon, SparklesIcon, ShieldCheckIcon } from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn, formatPrice } from "@/lib/utils";
import {
  useCreateOrder,
  useGetPlans,
  useGetUserOrder,
} from "@/lemonsqueezy/queries";
import { Badge } from "./ui/badge";

interface PlansDialogProps {
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export default function PlansDialog({
  children,
  className,
  overlayClassName,
}: PlansDialogProps) {
  const [showPlanDialog, setShowPlanDialog] = useLocalStorage(
    "show-plans-dialog",
    false
  );

  const [open, setOpen] = useState(false);

  const plans = useGetPlans();
  const userOrder = useGetUserOrder();
  const createOrder = useCreateOrder();

  return (
    <AlertDialog
      open={!children ? showPlanDialog : open}
      onOpenChange={!children ? setShowPlanDialog : setOpen}
    >
      {children ? (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        className={cn("sm:max-w-[440px]", className)}
        overlayClassName={overlayClassName}
      >
        <div className="mb-2 flex flex-col gap-2">
          <div
            className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            <SparklesIcon className="text-primary" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              Unlock Premium Access
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              One-time purchase, lifetime access.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const planId = formData.get("plan");
            console.log(planId);
            if (planId) {
              createOrder.mutate(
                { variantId: planId as string },
                {
                  onSuccess: () =>
                    localStorage.setItem("show-plans-dialog", "false"),
                }
              );
            }
          }}
        >
          <RadioGroup
            className="gap-2"
            name="plan"
            defaultValue={plans.data?.[0].variantId.toString()}
          >
            {plans.data
              ?.filter((plan) => plan.name.toLowerCase() !== "products")
              .map((plan, index) => (
                <div
                  key={plan.variantId}
                  className="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent group hover:bg-accent/50 relative flex w-full items-center gap-3 rounded-md border px-4 py-3 shadow-xs transition-colors outline-none"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={plan.variantId.toString()}>
                        {plan.name}{" "}
                        {plan.variantId === userOrder.data?.variantId && (
                          <Badge variant="secondary">Current plan</Badge>
                        )}
                      </Label>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Pay once, use forever
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <RadioGroupItem
                      value={plan.variantId.toString()}
                      id={plan.variantId.toString()}
                      aria-describedby={plan.variantId.toString()}
                      className="order-1 after:absolute after:inset-0"
                    />
                    {plan.price !== 0 && (
                      <p className="font-medium">{formatPrice(plan.price)}</p>
                    )}
                  </div>
                </div>
              ))}
          </RadioGroup>

          <div className="bg-muted/50 rounded-lg border p-4">
            <p className="mb-3 font-medium">What&apos;s included:</p>
            <ul className="grid gap-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-1 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong>Unlimited Projects</strong>
                  <p className="text-muted-foreground text-xs">
                    Create as many projects as you need
                  </p>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-1 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong>No Watermarks</strong>
                  <p className="text-muted-foreground text-xs">
                    Export clean, professional results
                  </p>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-1 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong>Team Collaboration</strong>
                  <p className="text-muted-foreground text-xs">
                    Add unlimited users and viewers
                  </p>
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-green-500/50 bg-green-50/50 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="text-green-600" size={16} />
              <p className="text-sm font-medium text-green-700">
                7-day money back guarantee
              </p>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Try it risk-free. Not satisfied? Get a full refund within 7 days.
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              className="relative w-full overflow-hidden"
              disabled={createOrder.isPending}
            >
              <SparklesIcon className="mr-2 h-4 w-4" />
              Unlock Premium Access
            </Button>
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={createOrder.isPending}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
