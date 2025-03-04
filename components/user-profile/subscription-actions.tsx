import { useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { PauseIcon } from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useSubscriptionSettings } from "@/lemonsqueezy/queries";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { format } from "date-fns";

export function SubscriptionActions({
  subscriptionId,
  renewAt,
}: {
  subscriptionId: string;
  renewAt: string;
}) {
  const [open, setOpen] = useState(false);
  const subscriptionSettings = useSubscriptionSettings();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent overlayClassName="bg-background">
        <DialogHeader>
          <DialogTitle>Would you like to pause or cancel?</DialogTitle>
          <DialogDescription>
            <p className="text-muted-foreground">
              Pausing your subscription will stop your subscription from
              renewing at the end of the current period.
            </p>
            <p className="text-muted-foreground text-sm">
              If you decide to cancel, your subscription will remain active
              until the end of your current billing period.
            </p>
          </DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground mt-2 list-disc space-y-1 px-4 text-sm">
          <li>Pause: Temporarily suspend your subscription</li>
          <li>Cancel: End your subscription at period end</li>
        </ul>

        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src="https://wl28iu3axg.ufs.sh/f/oXdJ2JUESNJ1zwaO5uv1El6svXwG3mdnzaYMFHSq5jCrUkZN"
            alt="Subscription actions"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="hover:bg-muted w-full"
            onClick={() =>
              subscriptionSettings.mutate(
                {
                  subscriptionId,
                  type: "pause",
                },
                {
                  onSuccess: () => {
                    setOpen(false);
                  },
                }
              )
            }
            disabled={subscriptionSettings.isPending}
          >
            <PauseIcon className="mr-2 h-4 w-4" />
            Pause Subscription
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={subscriptionSettings.isPending}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Before you go...</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-4">
                    <p>
                      We value your membership and want to make sure you don't
                      miss out on upcoming features. Would you like to pause
                      your subscription instead?
                    </p>

                    <div className="bg-muted/50 rounded-lg border p-3 text-sm">
                      <p className="font-medium">Benefits of pausing:</p>
                      <ul className="text-muted-foreground mt-2 list-disc pl-4">
                        <li>Keep your account settings and preferences</li>
                        <li>
                          Access to all features until current period ends
                        </li>
                        <li>Resume anytime with just one click</li>
                        <li>No charge during pause period</li>
                      </ul>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    subscriptionSettings.mutate(
                      {
                        subscriptionId,
                        type: "pause",
                      },
                      {
                        onSuccess: () => {
                          setOpen(false);
                        },
                      }
                    )
                  }
                  disabled={subscriptionSettings.isPending}
                >
                  <PauseIcon className="mr-2 h-4 w-4" />
                  Pause Subscription
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={subscriptionSettings.isPending}
                    >
                      Continue with Cancellation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent overlayClassName="bg-transparent">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-4">
                          <p>By canceling your subscription:</p>
                          <ul className="text-muted-foreground list-disc space-y-2 pl-4 text-sm">
                            <li>
                              Your access continues until{" "}
                              <span className="text-foreground font-medium">
                                {format(new Date(renewAt), "MMMM d, yyyy")}
                              </span>
                            </li>
                            <li>
                              You can resume this subscription anytime before{" "}
                              {format(new Date(renewAt), "MMMM d, yyyy")}
                            </li>
                            <li>
                              After that date, you'll need to create a new
                              subscription to regain access
                            </li>
                          </ul>

                          <div className="bg-muted/50 mt-4 rounded-lg border p-3">
                            <p className="text-muted-foreground text-sm">
                              Remember: You can pause your subscription instead
                              to keep your account ready for when you return.
                              <span className="text-foreground mt-2 block font-medium">
                                Are you absolutely sure you want to cancel?
                              </span>
                            </p>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button
                          variant="outline"
                          disabled={subscriptionSettings.isPending}
                        >
                          Go Back
                        </Button>
                      </AlertDialogCancel>
                      <Button
                        variant="destructive"
                        disabled={subscriptionSettings.isPending}
                        onClick={() =>
                          subscriptionSettings.mutate(
                            {
                              subscriptionId,
                              type: "cancel",
                            },
                            {
                              onSuccess: () => {
                                setOpen(false);
                              },
                            }
                          )
                        }
                      >
                        Yes, Cancel My Subscription
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
