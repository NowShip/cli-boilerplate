"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, deleteTask, getTasks } from "@/lib/action";
import { useGetUser } from "@/hooks/useGetUser";
import { useLogoutMutation } from "@/hooks/useAuth";
import UserProfile from "@/components/user-profile";

export default function Home() {
  const { data: user, isPending: isUserPending } = useGetUser();
  const { mutate: signOut } = useLogoutMutation();

  const queryClient = useQueryClient();

  const tasks = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

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
      <ul>
        {tasks.isPending
          ? "Loading..."
          : tasks.isError
            ? "error.."
            : tasks.data.length === 0
              ? "No tasks"
              : tasks.data.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between"
                  >
                    {task.title}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTaskMutation.mutate(task.id)}
                      disabled={!user}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
      </ul>
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();

          if (!user) {
            toast.error("You must be logged in to create a task");
            return;
          }

          const formData = new FormData(event.target as HTMLFormElement);
          const title = formData.get("title") as string;
          createTaskMutation.mutate(title, {
            onSuccess: () => {
              toast.success("Task created");
              (event.target as HTMLFormElement).reset();
            },
            onError: () => {
              toast.error("Failed to create task");
            },
          });
        }}
      >
        <Input type="text" name="title" placeholder="Task title" />
        <Button type="submit" className="mt-4">
          Create
        </Button>
      </form>
    </div>
  );
}
