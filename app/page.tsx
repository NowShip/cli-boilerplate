"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, deleteTask, getTasks } from "@/lib/action";

export default function Home() {
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
    <div className="max-w-sm mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <ul>
        {tasks.isPending
          ? "Loading..."
          : tasks.isError
          ? "error.."
          : tasks.data.length === 0
          ? "No tasks"
          : tasks.data.map((task) => (
              <li key={task.id} className="flex justify-between items-center">
                {task.title}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </li>
            ))}
      </ul>
      <form
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
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
