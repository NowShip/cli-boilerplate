"use client";

import {
  CalendarIcon,
  CreditCardIcon,
  AlertCircleIcon,
  CircleAlertIcon,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetUser } from "@/hooks/useGetUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  useGetCustomerPortalUrl,
  useGetUserSubscription,
  useSubscriptionSettings,
} from "@/lemonsqueezy/queries";
import { useDeleteAccount } from "@/hooks/useAuth";
import ClientOnly from "@/components/client-only";
import PlansDialog from "@/components/plans-dialog";
import { Badge } from "@/components/ui/badge";
import DeleteUser from "./delete-user";
import { SubscriptionActions } from "./subscription-actions";

interface UserProfileProps {
  children?: React.ReactNode;
}

export default function UserProfile({ children }: UserProfileProps) {
  const { data: user } = useGetUser();
  const userSubscription = useGetUserSubscription();

  const { status, variantName, cardBrand, cardLastFour, renewsAt, endsAt } =
    userSubscription.data || {};

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            Profile
          </DialogTitle>
          <DialogClose className="translate-y-0.5" />
        </DialogHeader>
        <div className="mt-4 px-6">
          <div className="border-background bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 shadow-xs shadow-black/10">
            <Avatar>
              <AvatarImage src={user?.user?.image || ""} />
              <AvatarFallback>{user?.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="space-y-4 px-6 pt-4 pb-6">
          <button className="sr-only"></button>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`name`}>Name</Label>
            <Input
              id={`name`}
              placeholder="Matt"
              defaultValue={user?.user?.name}
              type="text"
              readOnly
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`email`}>Email</Label>
            <Input
              id={`email`}
              placeholder="matt@example.com"
              defaultValue={user?.user?.email}
              type="text"
              readOnly
            />
          </div>
        </div>
        <Separator />
        <div className="w-full space-y-6 p-4">
          {/* Subscription Header */}
          {status === "expired" ? (
            <div className="rounded-md border border-red-500/50 px-4 py-3 text-red-600">
              <div className="flex gap-3">
                <CircleAlertIcon
                  className="mt-0.5 shrink-0 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">
                  Your subscription ended on{" "}
                  {endsAt ? format(new Date(endsAt), "MMMM d, yyyy") : ""}.
                  Renew now to regain access to all premium features.
                </p>
              </div>
            </div>
          ) : status ? (
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="text-sm font-medium capitalize"
              >
                {variantName} Plan
              </Badge>
              <Badge
                variant={status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {status}
              </Badge>
            </div>
          ) : null}

          {/* Payment Details */}
          {status && status !== "expired" ? (
            <div className="space-y-3">
              {/* Renewal Date */}
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">
                  {renewsAt
                    ? `Renews ${format(new Date(renewsAt), "MMMM d, yyyy")}`
                    : "No renewal date"}
                </span>
              </div>

              {/* Payment Method */}
              {(cardLastFour || cardBrand) && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCardIcon className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">
                    {cardBrand && (
                      <span className="capitalize">{cardBrand}</span>
                    )}
                    {cardLastFour && <span> •••• {cardLastFour}</span>}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Action Button */}
          {!status || status === "expired" ? (
            <ClientOnly>
              <PlansDialog overlayClassName="bg-transparent">
                <Button className="w-full">Upgrade to Pro</Button>
              </PlansDialog>
            </ClientOnly>
          ) : (
            <SubscriptionButton />
          )}
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DeleteUser />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionButton() {
  const userSubscription = useGetUserSubscription();
  const subscriptionSettings = useSubscriptionSettings();

  const { status } = userSubscription.data || {};

  if (status === "paused") {
    return (
      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() =>
          subscriptionSettings.mutate({
            subscriptionId: userSubscription.data?.subscriptionId || "",
            type: "unpause",
          })
        }
        disabled={subscriptionSettings.isPending}
      >
        Unpause Subscription
      </Button>
    );
  }

  if (status === "cancelled") {
    return (
      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() =>
          subscriptionSettings.mutate({
            subscriptionId: userSubscription.data?.subscriptionId || "",
            type: "resume",
          })
        }
        disabled={subscriptionSettings.isPending}
      >
        Resume Subscription
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <PlansDialog overlayClassName="bg-transparent">
        <Button variant="outline" className="w-full" size="sm">
          Change Plan
        </Button>
      </PlansDialog>
      <SubscriptionActions
        subscriptionId={userSubscription.data?.subscriptionId || ""}
        renewAt={userSubscription.data?.renewsAt || ""}
      />
    </div>
  );
}
