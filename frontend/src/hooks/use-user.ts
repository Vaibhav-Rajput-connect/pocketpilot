"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import type { ProfileUpdateFormData } from "@/lib/validators";

export function useUser() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateFormData) => {
      const response = await apiClient.put("/users/profile", data);
      return response.data;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      throw new Error(getErrorMessage(error));
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
  };
}
