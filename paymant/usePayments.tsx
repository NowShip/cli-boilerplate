"use client";

import { useQuery, useMutation } from "@tanstack/react-query";

import { createCheckout, getPlans, getUserOrder } from "./action";
import { useGetUser } from "@/auth/useAuth";
import { toast } from "sonner";

export const useGetPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await getPlans();

      if (response.message) {
        throw new Error(response.message);
      }

      return response.data?.sort((a, b) => a.price - b.price);
    },
    retry: false,
    staleTime: 6000 * 60 * 1, // 1 hours
  });
};

export const useGetUserOrder = () => {
  const { data: user } = useGetUser();

  return useQuery({
    queryKey: ["order", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const response = await getUserOrder(user.id);

      if (response.message) {
        throw new Error(response.message);
      }

      return response.data;
    },
    enabled: !!user?.id,
    staleTime: 6000 * 60 * 1, // 1 hours
    refetchOnWindowFocus: "always",
  });
};

export const useCreateOrder = () => {
  const { data: user } = useGetUser();

  return useMutation({
    mutationFn: async ({ variantId }: { variantId: string | number }) => {
      if (!user) {
        throw new Error("User not found");
      }

      const response = await createCheckout({
        variantId: variantId.toString(),
        userId: user.id,
        attributes: {
          productOptions: {
            redirectUrl: window.location.href,
          },
        },
      });

      if (!response.data) {
        throw new Error(response.message || "Failed to create checkout");
      }

      return response.data;
    },
    onSuccess: (data) => {
      window.location.href = data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
