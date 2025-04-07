// src/hooks/prompts/queries/user/useUserMetadata.ts
import { userApi } from "@/services/api/UserApi";
import { QUERY_KEYS } from "@/constants/queryKeys"; // Updated import
import { useQuery } from "react-query";

/**
 * Hook to fetch user metadata including pinned folder IDs
 */
export function useUserMetadata() {
  return useQuery(
    [QUERY_KEYS.USER_METADATA],
    async () => {
      const response = await userApi.getUserMetadata();
      if (!response.success) {
        throw new Error(response.error || 'Failed to load user metadata');
      }
      return response.data || {};
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error: Error) => {
        console.error('Failed to load user metadata:', error);
      }
    }
  );
}