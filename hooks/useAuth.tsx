import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { APIError } from "better-auth";
import { toast } from "sonner";

import { authClient, signIn, signOut } from "@/lib/auth-client";

export function useLogoutMutation() {
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

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async () => {
      try {
        const { data, error } = await signIn.social({
          provider: "google",
          callbackURL: `${window.location.origin}/`,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to sign in with google");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.deleteUser({
        callbackURL: `/goodbye`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
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
