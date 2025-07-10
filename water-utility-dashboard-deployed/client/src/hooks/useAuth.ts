import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Return mock user data for demonstration purposes
  const mockUser = {
    id: 5,
    username: "Ogelo",
    email: "augustineogelo1@gmail.com",
    fullName: "Augustine Ogelo",
    role: "analyst",
    department: "Water Operations"
  };

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always check for fresh auth state
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user: user || mockUser, // Use real user if available, otherwise use mock user
    isLoading: false, // Always ready for demo
    isAuthenticated: true, // Always authenticated for demo
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}