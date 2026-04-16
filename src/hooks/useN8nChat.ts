// src/hooks/useN8nChat.ts
import { useState, useCallback } from "react";
import { createNewChat } from "../models/chat.model";
import type { Chat, Message, N8nPayload } from "../models/chat.model";

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? '/api/chat';

interface UseN8nChatReturn {
  chats: Chat[];
  activeChat: string;
  setActiveChat: (id: string) => void;
  createChat: () => void;
  deleteChat: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  isTyping: boolean;
  activeMessages: Message[];
}

export function useN8nChat(initialChats: Chat[]): UseN8nChatReturn {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<string>(initialChats[0]?.id ?? "");
  const [isTyping, setIsTyping] = useState(false);

  const activeMessages: Message[] =
    chats.find((c) => c.id === activeChat)?.messages ?? [];

  const updateChat = useCallback(
    (id: string, patch: Partial<Chat>) => {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const addMessage = useCallback(
    (chatId: string, message: Message) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [...c.messages, message],
                preview: message.content.slice(0, 60),
                title:
                  c.messages.length === 0 && message.role === "user"
                    ? message.content.slice(0, 40)
                    : c.title,
              }
            : c
        )
      );
    },
    []
  );

  const createChat = useCallback(() => {
    const newChat = createNewChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeChat === id && filtered.length > 0) {
          setActiveChat(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeChat]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      addMessage(activeChat, userMsg);
      setIsTyping(true);

      try {
        if (!N8N_WEBHOOK_URL) throw new Error("VITE_N8N_WEBHOOK_URL no definida");

        const payload: N8nPayload = {
          action: "sendMessage",
          sessionId: activeChat,
          chatInput: content.trim(),
          pregunta: content.trim(),
        };

        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`n8n error ${res.status}`);

        const raw = await res.json();
        console.log("🔴 RAW n8n response:", JSON.stringify(raw, null, 2));
        const normalized = Array.isArray(raw) ? raw[0] : raw;

        let textValue: string =
          typeof normalized === "string"
            ? normalized
            : normalized.respuesta ?? normalized.output ?? normalized.text ?? normalized.message ?? JSON.stringify(normalized);

        const mdJsonMatch = textValue.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (mdJsonMatch) {
          try {
            const inner = JSON.parse(mdJsonMatch[1].trim());
            textValue = inner.respuesta ?? inner.output ?? inner.text ?? inner.message ?? JSON.stringify(inner);
          } catch {
            textValue = mdJsonMatch[1].trim();
          }
        }

        // ── URL viene en campo separado "imagen_url" ──────────────────
        let chartUrl: string | undefined = normalized.imagen_url ?? undefined;

// ── FALLBACK: buscar URL de quickchart dentro del texto ───────
if (!chartUrl) {
  const quickchartMatch = textValue.match(
    /https?:\/\/quickchart\.io\/chart[^\s)\]"']*/
  );
  if (quickchartMatch) chartUrl = quickchartMatch[0];
}

// Sanitizar font malformado en la URL
if (chartUrl) {
  try {
    const urlObj = new URL(chartUrl);
    const cParam = urlObj.searchParams.get('c');
    if (cParam) {
      let fixedJson = decodeURIComponent(cParam);
      fixedJson = fixedJson.replace(
        /"font"\s*:\s*"weight"\s*:\s*"(\w+)"\s*,\s*"size"\s*:\s*(\d+)/g,
        '"font":{"weight":"$1","size":$2}'
      );
      urlObj.searchParams.set('c', fixedJson);
      chartUrl = urlObj.toString();
    }
  } catch (_) {}
}

// Limpiar texto: quitar ![...](url) y [texto](url-quickchart)
const cleanText = textValue
  .replace(/!\[.*?\]\([^)]*\)/g, "")
  .replace(/\[.*?\]\(https?:\/\/quickchart\.io[^)]*\)/g, "")
  .trim();

        // ─────────────────────────────────────────────────────────────

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: cleanText,
          chartUrl,
          timestamp: new Date(),
        };
        addMessage(activeChat, assistantMsg);

      } catch (err) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ Error al conectar con el agente: ${(err as Error).message}`,
          timestamp: new Date(),
        };
        addMessage(activeChat, errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChat, addMessage]
  );

  return {
    chats,
    activeChat,
    setActiveChat,
    createChat,
    deleteChat,
    sendMessage,
    isTyping,
    activeMessages,
  };
}