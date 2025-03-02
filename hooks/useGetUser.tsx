import { useQuery } from "@tanstack/react-query";
import type { APIError } from "better-auth";

import { authClient } from "@/lib/auth-client";

export function useGetUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to fetch user");
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: "always",
  });
}
