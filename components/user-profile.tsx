import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CreditCardIcon } from "lucide-react";

import { useGetUser } from "@/hooks/useGetUser";
import { useDeleteAccount, useLogoutMutation } from "@/hooks/useAuth";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "./ui/badge";

import {
  useGetUserSubscription,
  useGetCustomerPortalUrl,
  useSubscriptionSettings,
} from "@/lemonsqueezy/queries";
import ClientOnly from "./client-only";
import PlansDialog from "./plans-dialog";

export default function UserProfile() {
  const { data: user } = useGetUser();
  const { mutate: signOut } = useLogoutMutation();
  const deleteAccount = useDeleteAccount();

  const userSubscription = useGetUserSubscription();

  const [open, setOpen] = useState(false);

  if (!user) return null;

  const { status, variantName, cardBrand, cardLastFour, renewsAt } =
    userSubscription.data || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar>
          <AvatarImage src={user.user.image ?? undefined} />
          <AvatarFallback>
            {user.user.name.charAt(0)}
            {user.user.name.charAt(1)}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center gap-2 text-center sm:max-w-80">
        <Avatar className="h-18 w-18">
          <AvatarImage src={user.user.image ?? undefined} />
          <AvatarFallback>
            {user.user.name.charAt(0)}
            {user.user.name.charAt(1)}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium">{user.user.name}</p>
          <p className="truncate text-xs text-gray-500">{user.user.email}</p>
        </div>
        <Separator className="my-4" />
        <div className="w-full space-y-6 rounded-lg border p-4">
          {/* Subscription Header */}
          {status ? (
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
          {status ? (
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
          {!status ? (
            <ClientOnly>
              <PlansDialog overlayClassName="bg-transparent">
                <Button className="w-full" size="sm">
                  Upgrade to Pro
                </Button>
              </PlansDialog>
            </ClientOnly>
          ) : (
            <SubscriptionButton />
          )}
        </div>
        <Separator className="my-4" />
        <div className="flex w-full flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              signOut(undefined, {
                onSuccess: () => {
                  setOpen(false);
                },
              })
            }
          >
            Logout
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="px-0">
                  <Button
                    variant="destructive"
                    onClick={() => deleteAccount.mutate()}
                    disabled={deleteAccount.isPending}
                  >
                    Delete Account
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubscriptionButton() {
  const userSubscription = useGetUserSubscription();
  const getCustomerPortalUrl = useGetCustomerPortalUrl();
  const subscriptionSettings = useSubscriptionSettings();

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() =>
          getCustomerPortalUrl.mutate({
            subscriptionId: userSubscription.data?.subscriptionId || "",
          })
        }
      >
        Manage Subscription
      </Button>
      {status !== "cancelled" ? (
        status === "active" ? (
          <Button
            className="w-full"
            size="sm"
            onClick={() =>
              subscriptionSettings.mutate({
                subscriptionId: userSubscription.data?.subscriptionId || "",
                type: "pause",
              })
            }
            disabled={subscriptionSettings.isPending}
          >
            Pause Subscription
          </Button>
        ) : (
          <Button
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
        )
      ) : null}
      {status === "cancelled" ? (
        <Button
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
      ) : (
        <Button
          variant="destructive"
          className="w-full"
          size="sm"
          onClick={() =>
            subscriptionSettings.mutate({
              subscriptionId: userSubscription.data?.subscriptionId || "",
              type: "cancel",
            })
          }
          disabled={subscriptionSettings.isPending}
        >
          Cancel Subscription
        </Button>
      )}
    </div>
  );
}
