"use client";

import { LogOutIcon } from "lucide-react";

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
  useCreateOrder,
  useGetPlans,
  useGetUserOrder,
} from "@/lemonsqueezy/queries";
import { useLogoutMutation } from "@/hooks/useAuth";
import DeleteUser from "./delete-user";
import Refunded from "./refunded";
import Paid from "./paid";
import GetFullAccess from "./get-full-access";

interface UserProfileProps {
  children?: React.ReactNode;
}

export default function UserProfile({ children }: UserProfileProps) {
  const { data: user } = useGetUser();
  const userOrder = useGetUserOrder();
  const { mutate: signOut } = useLogoutMutation();
  const createOrder = useCreateOrder();
  const plans = useGetPlans();

  const { status } = userOrder.data || {};

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

        {/* Action Button */}
        <div className="px-6 py-4">
          {status === "paid" ? (
            <Paid />
          ) : status === "refunded" ? (
            <Refunded />
          ) : (
            <GetFullAccess />
          )}
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" size="icon" onClick={() => signOut()}>
            <LogOutIcon className="h-4 w-4" />
          </Button>
          <DeleteUser />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
