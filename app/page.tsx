"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useGetUser } from "@/hooks/useGetUser";
import { useLogoutMutation } from "@/hooks/useAuth";
import UserProfile from "@/components/user-profile";
import { cn } from "@/lib/utils";

import { useGetUserSubscription } from "@/lemonsqueezy/queries";
import Pricing from "@/components/pricing";

export default function Home() {
  const { data: user, isPending: isUserPending } = useGetUser();
  const { mutate: signOut } = useLogoutMutation();

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

      <Pricing />
    </div>
  );
}
