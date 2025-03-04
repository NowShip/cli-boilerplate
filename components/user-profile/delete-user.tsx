"use client";

import { useEffect, useId, useState } from "react";
import { CircleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAccount } from "@/hooks/useAuth";

const PROJECT_NAME = "DELETE";

export default function DeleteUser() {
  const [clicked, setClicked] = useState(false);
  const [counter, setCounter] = useState(4);

  const deleteAccount = useDeleteAccount();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (clicked && counter > 0) {
      timer = setInterval(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
    }

    if (counter === 0) {
      setClicked(false);
      setCounter(4);
      deleteAccount.mutate();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [clicked, counter]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent overlayClassName="bg-background" className="md:max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Final confirmation
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              This action cannot be undone. To confirm, please enter{" "}
              <span className="text-foreground">DELETE</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="*:not-first:mt-2">
            <Label htmlFor={"name"}>Project name</Label>
            <Input
              id={"name"}
              type="text"
              placeholder="Type Origin UI to confirm"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="flex-1"
              disabled={inputValue !== PROJECT_NAME || deleteAccount.isPending}
              onClick={() => {
                setClicked(!clicked);
                setCounter(4);
              }}
            >
              {clicked ? `Undo (${counter})` : "Delete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
