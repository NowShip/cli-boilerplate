"use client";

import { useState, useEffect } from "react";
import { CheckIcon, RefreshCcwIcon } from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { format } from "date-fns";

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
  useCreateSubscription,
  useGetPlans,
  useGetUserSubscription,
  useSubscriptionSettings,
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPlanDialog, setShowPlanDialog] = useLocalStorage(
    "show-plans-dialog",
    false
  );

  const [open, setOpen] = useState(false);

  const plans = useGetPlans();
  const userSubscription = useGetUserSubscription();
  const createSubscription = useCreateSubscription();
  const updateSubscription = useSubscriptionSettings();

  const isChangePlan = userSubscription.data?.status === "active";

  // useEffect(() => {
  //   if (userSubscription.data?.variantId) {
  //     setSelectedPlan(userSubscription.data?.variantId.toString());
  //   } else if (plans.data && !selectedPlan) {
  //     setSelectedPlan(plans.data?.[1].variantId.toString() || null);
  //   }
  // }, [plans.data]);

  return (
    <AlertDialog
      open={!children ? showPlanDialog : open}
      onOpenChange={!children ? setShowPlanDialog : setOpen}
    >
      {children ? (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        className={cn(className)}
        overlayClassName={overlayClassName}
      >
        <div className="mb-2 flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <RefreshCcwIcon className="opacity-80" size={16} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              {isChangePlan ? "Change your plan" : "Upgrade"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Pick one of the following plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <form className="space-y-5">
          <RadioGroup
            className="gap-2"
            defaultValue={selectedPlan || ""}
            onValueChange={setSelectedPlan}
          >
            {plans.data
              ?.filter((plan) => plan.name.toLowerCase() !== "products")
              .map((plan) => (
                <div
                  key={plan.variantId}
                  className="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none"
                >
                  <RadioGroupItem
                    value={plan.variantId.toString()}
                    id={plan.variantId.toString()}
                    aria-describedby={plan.variantId.toString()}
                    className="order-1 after:absolute after:inset-0"
                  />
                  <div className="grid grow gap-1">
                    <Label htmlFor={plan.variantId.toString()}>
                      {plan.name}{" "}
                      {plan.variantId === userSubscription.data?.variantId && (
                        <Badge>Current plan</Badge>
                      )}
                    </Label>
                    {plan.price !== 0 ? (
                      <p
                        id={plan.variantId.toString()}
                        className="text-muted-foreground text-xs"
                      >
                        {formatPrice(plan.price)}/month
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
          </RadioGroup>

          <div className="space-y-3">
            <p>
              <strong className="text-sm font-medium">Features include:</strong>
            </p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                Create unlimited projects.
              </li>
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                Remove watermarks.
              </li>
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                Add unlimited users and free viewers.
              </li>
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                Upload unlimited files.
              </li>
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                7-day money back guarantee.
              </li>
              <li className="flex gap-2">
                <CheckIcon
                  size={16}
                  className="text-primary mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                Advanced permissions.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-medium">How billing works:</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <span className="font-medium">Upgrading:</span> Immediate
                access. You&apos;ll only be charged the pro-rated difference for
                the remaining period.
              </li>
              <li>
                <span className="font-medium">Downgrading:</span> Continues
                current plan until{" "}
                {userSubscription.data?.renewsAt
                  ? format(
                      new Date(userSubscription.data?.renewsAt),
                      "MMMM d, yyyy"
                    )
                  : "the end of your current billing period"}
                , then switches to new plan.
              </li>
            </ul>
          </div>

          <div className="grid gap-2">
            {isChangePlan ? (
              <Button
                type="button"
                className="w-full"
                disabled={
                  (selectedPlan || "") ===
                    userSubscription.data?.variantId?.toString() ||
                  updateSubscription.isPending
                }
                onClick={() =>
                  updateSubscription.mutate(
                    {
                      subscriptionId:
                        userSubscription.data?.subscriptionId || "",
                      type: "change_plan",
                      variantId: selectedPlan || "",
                    },
                    {
                      onSuccess: () => {
                        setOpen(false);
                      },
                    }
                  )
                }
              >
                Change plan
              </Button>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={() =>
                  selectedPlan &&
                  createSubscription.mutate({ variantId: selectedPlan })
                }
                disabled={createSubscription.isPending}
              >
                Upgrade
              </Button>
            )}
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={
                  createSubscription.isPending || updateSubscription.isPending
                }
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
