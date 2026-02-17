import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UserWithLastMessage } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";

// ============================================
// User Chat Hooks
// ============================================

export function useMessages() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: isAuthenticated,
    refetchInterval: 3000, // Poll every 3s for new messages (MVP real-time)
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const validated = api.messages.send.input.parse({ content });
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.send.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
  });
}

// ============================================
// Admin Hooks
// ============================================

export function useAdminUsers() {
  const { user } = useAuth();
  // Simple check - in real app, backend enforces 403
  const isAdmin = true; // Assuming role based on context or backend handles it
  
  return useQuery({
    queryKey: [api.admin.listUsers.path],
    queryFn: async () => {
      const res = await fetch(api.admin.listUsers.path, { credentials: "include" });
      if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.listUsers.responses[200].parse(await res.json());
    },
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useAdminUserMessages(userId: string | null) {
  return useQuery({
    queryKey: [api.admin.getMessages.path, userId],
    queryFn: async () => {
      if (!userId) return [];
      const url = buildUrl(api.admin.getMessages.path, { userId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user messages");
      return api.admin.getMessages.responses[200].parse(await res.json());
    },
    enabled: !!userId,
    refetchInterval: 3000,
  });
}

export function useAdminReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, content }: { userId: string; content: string }) => {
      const validated = api.admin.reply.input.parse({ content });
      const url = buildUrl(api.admin.reply.path, { userId });
      const res = await fetch(url, {
        method: api.admin.reply.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return api.admin.reply.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific user's message history
      queryClient.invalidateQueries({ 
        queryKey: [api.admin.getMessages.path, variables.userId] 
      });
    },
  });
}
