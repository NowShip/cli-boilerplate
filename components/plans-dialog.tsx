"use client";

import { CheckIcon, RefreshCcwIcon } from "lucide-react";
import { useLocalStorage } from "@uidotdev/usehooks";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog
      open={!children ? showPlanDialog : undefined}
      onOpenChange={!children ? setShowPlanDialog : undefined}
    >
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent
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
          <DialogHeader>
            <DialogTitle className="text-left">Change your plan</DialogTitle>
            <DialogDescription className="text-left">
              Pick one of the following plans.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <RadioGroup className="gap-2" defaultValue="2">
            {/* Radio card #1 */}
            <div className="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none">
              <RadioGroupItem
                value="1"
                id="1"
                aria-describedby="1-description"
                className="order-1 after:absolute after:inset-0"
              />
              <div className="grid grow gap-1">
                <Label htmlFor="1">Essential</Label>
                <p id="1-description" className="text-muted-foreground text-xs">
                  $4 per member/month
                </p>
              </div>
            </div>
            {/* Radio card #2 */}
            <div className="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none">
              <RadioGroupItem
                value="2"
                id="2"
                aria-describedby="2-description"
                className="order-1 after:absolute after:inset-0"
              />
              <div className="grid grow gap-1">
                <Label htmlFor="2">Standard</Label>
                <p id="2-description" className="text-muted-foreground text-xs">
                  $19 per member/month
                </p>
              </div>
            </div>
            {/* Radio card #3 */}
            <div className="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none">
              <RadioGroupItem
                value="3"
                id="3"
                aria-describedby="3-description"
                className="order-1 after:absolute after:inset-0"
              />
              <div className="grid grow gap-1">
                <Label htmlFor="3">Enterprise</Label>
                <p id="3-description" className="text-muted-foreground text-xs">
                  $32 per member/month
                </p>
              </div>
            </div>
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

          <div className="grid gap-2">
            <Button type="button" className="w-full">
              Change plan
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="w-full">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
