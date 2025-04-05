import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import type { APIError } from "better-auth";
import { toast } from "sonner";

import { authClient, signIn, signOut, signUp } from "@/auth/auth-client";

export function useGetUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (error) {
          throw new Error(error.message);
        }

        const user: UserData = {
          id: data.user.id,
          email: data.user.email,
          emailVerified: data.user.emailVerified,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          name: data.user.name,
          image: data.user.image,
        };

        return user;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to fetch user");
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: "always",
    retry: false,
  });
}

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
      queryClient.setQueryData(["user"], null);
    },
    onError: (error) => {
      console.error(error);
    },
  });
}

export function useSignUpWithEmail() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      try {
        const { data, error } = await signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to sign up with email");
      }
    },
    onSuccess: () => {
      router.push("/");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useSignInWithEmail() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      try {
        const { data, error } = await signIn.email({ email, password });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        const err = error as APIError;
        throw new Error(err.message || "Failed to sign in with email");
      }
    },
    onSuccess: () => {
      router.push("/");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      toast.error(error.message);
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
      queryClient.setQueryData(["user"], null);
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
