"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useGetUser } from "@/hooks/useGetUser";
import { useLogoutMutation } from "@/hooks/useAuth";
import UserProfile from "@/components/user-profile";
import { cn } from "@/lib/utils";

import Pricing from "@/components/pricing";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { useGetUserOrder } from "@/lemonsqueezy/queries";

export default function Home() {
  const { data: user, isPending: isUserPending } = useGetUser();
  const { mutate: signOut } = useLogoutMutation();

  const userOrder = useGetUserOrder();

  return (
    <div className="mx-auto max-w-sm py-12">
      <div className="mb-8 flex items-center gap-4">
        {user && (
          <UserProfile>
            <Avatar>
              <AvatarImage src={user?.user.image || ""} />
              <AvatarFallback>
                {user?.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </UserProfile>
        )}
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
      <div
        className={cn(
          "flex h-24 items-center justify-center rounded-2xl border",
          userOrder.data?.status === "paid" && "border-transparent bg-green-500"
        )}
      >
        FULL ACCESS
      </div>

      <Pricing />
    </div>
  );
}
