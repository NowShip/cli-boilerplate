import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { APIError } from "better-auth";

import { signOut } from "@/lib/auth-client";

export function useSignOutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const { data, error } = await signOut();

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to sign out");
      }
    },
    onSuccess: () => {
      router.push("/login");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
