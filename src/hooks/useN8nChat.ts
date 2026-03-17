// src/hooks/useN8nChat.ts
import { useState, useCallback } from "react";
import { createNewChat } from "../models/chat.model";
import type { Chat, Message, N8nPayload } from "../models/chat.model";

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL as string;

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

  /** Mensajes del chat activo */
  const activeMessages: Message[] =
    chats.find((c) => c.id === activeChat)?.messages ?? [];

  /** Actualiza campos de un chat por id */
  const updateChat = useCallback(
    (id: string, patch: Partial<Chat>) => {
      setChats((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  /** Agrega un mensaje al chat activo */
  const addMessage = useCallback(
    (chatId: string, message: Message) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [...c.messages, message],
                preview: message.content.slice(0, 60),
                // Primera vez que el usuario escribe → usar su texto como título
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

  /** Crea un chat nuevo y lo activa */
  const createChat = useCallback(() => {
    const newChat = createNewChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, []);

  /** Elimina un chat y activa el siguiente disponible */
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

  /** Envía un mensaje al webhook de n8n */
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
        };

        console.log("📤 Enviando a n8n:", payload);
        console.log("🌐 URL:", N8N_WEBHOOK_URL);

        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`n8n error ${res.status}`);

        const data = await res.json();

        // n8n puede devolver { output: "..." } o { text: "..." } o string directo
        const responseText: string =
          typeof data === "string"
            ? data
            : data.output ?? data.text ?? data.message ?? JSON.stringify(data);

        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseText,
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