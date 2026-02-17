import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useApiTokens() {
  return useQuery({
    queryKey: [api.apiTokens.list.path],
    queryFn: async () => {
      const res = await fetch(api.apiTokens.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch API tokens");
      return api.apiTokens.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateApiToken() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch(api.apiTokens.create.path, {
        method: api.apiTokens.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create API token");
      return api.apiTokens.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apiTokens.list.path] });
      toast({ title: "Success", description: "API Token created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteApiToken() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.apiTokens.delete.path, { id });
      const res = await fetch(url, {
        method: api.apiTokens.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete API token");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apiTokens.list.path] });
      toast({ title: "Success", description: "API Token deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
