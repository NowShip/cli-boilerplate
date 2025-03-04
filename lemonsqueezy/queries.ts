"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getUserSubscription,
  getCustomerPortalUrl,
  subscriptionSettings,
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

      return response.data;
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
      return response.data || null;
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
    }: {
      subscriptionId: string;
      type: LemonSqueezySubscriptionTypes;
    }) => {
      const response = await subscriptionSettings(subscriptionId, type);

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
