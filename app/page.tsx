"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useGetUser } from "@/hooks/useGetUser";
import { useLogoutMutation } from "@/hooks/useAuth";
import UserProfile from "@/components/user-profile";
import { getPlans } from "@/lib/action";
import { cn } from "@/lib/utils";

import { createCheckout } from "@/lemonsqueezy/action";
import { useGetUserSubscription } from "@/lemonsqueezy/queries";

export default function Home() {
  const { data: user, isPending: isUserPending } = useGetUser();
  const { mutate: signOut } = useLogoutMutation();

  const plans = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    retry: false,
  });

  const userSubscription = useGetUserSubscription();

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 flex items-center gap-4">
        <UserProfile />
        {isUserPending ? (
          "Loading..."
        ) : !user ? (
          <>
            <Link href="/login">Login</Link>
            <Link href="/sign-up">Signup</Link>
          </>
        ) : (
          <Button onClick={() => signOut()}>Logout</Button>
        )}
      </div>
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <div className="grid grid-cols-3 gap-4">
        <div
          className={cn(
            "flex h-24 items-center justify-center rounded-2xl border",
            userSubscription.data?.variantName === "Free" &&
              "border-transparent bg-green-500"
          )}
        >
          Free
        </div>
        <div
          className={cn(
            "flex h-24 items-center justify-center rounded-2xl border",
            userSubscription.data?.variantName === "Pro" &&
              "border-transparent bg-green-500"
          )}
        >
          Pro
        </div>
        <div
          className={cn(
            "flex h-24 items-center justify-center rounded-2xl border",
            userSubscription.data?.variantName === "Business" &&
              "border-transparent bg-green-500"
          )}
        >
          Business
        </div>
      </div>

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
    </div>
  );
}

function CheckoutButton({ variantId }: { variantId: number }) {
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
    <Button
      className="mt-4 w-full"
      onClick={() => createCheckoutMutation.mutate()}
    >
      Subscribe
    </Button>
  );
}
