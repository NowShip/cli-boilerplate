"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getUserSubscription,
  getCustomerPortalUrl,
  subscriptionSettings,
  createCheckout,
} from "./action";
import { useGetUser } from "@/hooks/useGetUser";
import { toast } from "sonner";
import type { LemonSqueezySubscriptionTypes } from "./index";
import { getPlans } from "@/lib/action";

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
  });
};

export const useGetUserSubscription = () => {
  const { data: user } = useGetUser();

  return useQuery({
    queryKey: ["subscription", user?.user.id],
    queryFn: async () => {
      if (!user?.user.id) {
        throw new Error("User not found");
      }

      const response = await getUserSubscription(user.user.id);

      if (response.message) {
        throw new Error(response.message);
      }

      // Ensure we return null instead of undefined if data is missing
      return {
        ...response.data,
        currentPlan:
          response.data?.status !== "expired"
            ? response.data?.variantName.toLowerCase()
            : undefined,
      };
    },
    enabled: !!user?.user.id,
    staleTime: 6000 * 60 * 1, // 1 hours
  });
};

export const useGetCustomerPortalUrl = () => {
  return useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      const response = await getCustomerPortalUrl(subscriptionId);

      if (response.message) {
        throw new Error(response.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        window.open(data, "_blank");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useSubscriptionSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      type,
      variantId,
    }: {
      subscriptionId: string;
      type: LemonSqueezySubscriptionTypes;
      variantId?: string;
    }) => {
      const response = await subscriptionSettings({
        subscriptionId,
        type,
        variantId,
      });

      if (response.message) {
        throw new Error(response.message);
      }

      await new Promise((resolve) => setTimeout(resolve, 4000));

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateSubscription = () => {
  const { data: user } = useGetUser();

  return useMutation({
    mutationFn: async ({ variantId }: { variantId: string }) => {
      if (!user) {
        throw new Error("User not found");
      }

      const response = await createCheckout({
        variantId: variantId.toString(),
        userId: user.user.id,
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
