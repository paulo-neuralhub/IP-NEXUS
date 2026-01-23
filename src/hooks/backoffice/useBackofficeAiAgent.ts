import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BackofficeAiMessage = {
  role: "user" | "assistant";
  content: string;
  toolsUsed?: string[];
  createdAt: string;
};

export function useBackofficeAiAgent() {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<BackofficeAiMessage[]>([]);

  const sendMutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const nextMessages = [...messages, { role: "user" as const, content }];
      const { data, error } = await supabase.functions.invoke("backoffice-ai-agent", {
        body: {
          sessionId,
          messages: nextMessages,
        },
      });

      if (error) {
        // surface rate limit / credits cleanly when possible
        const status = (error as any)?.context?.status;
        if (status === 429) throw new Error("Rate limit: espera unos segundos y reintenta.");
        if (status === 402) {
          throw new Error(
            "Lovable AI sin crédito (402). Añade saldo en Workspace → Usage."
          );
        }
        throw error;
      }
      return data as { sessionId: string; message: string; toolsUsed?: string[] };
    },
    onSuccess: (data, vars) => {
      if (data?.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: vars.content, createdAt: new Date().toISOString() },
        {
          role: "assistant",
          content: data.message,
          toolsUsed: data.toolsUsed,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${msg}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
  });

  const clear = React.useCallback(() => {
    setSessionId(null);
    setMessages([]);
  }, []);

  return {
    sessionId,
    messages,
    isSending: sendMutation.isPending,
    send: (content: string) => sendMutation.mutate({ content }),
    clear,
  };
}
