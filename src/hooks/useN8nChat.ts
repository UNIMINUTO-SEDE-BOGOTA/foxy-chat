// src/hooks/useN8nChat.ts
import { useState, useCallback, useEffect } from "react";
import { createNewChat } from "../models/chat.model";
import type { Chat, Message, N8nPayload } from "../models/chat.model";
import {
  loadChats,
  saveChats,
  loadActiveChatId,
  saveActiveChatId,
} from "../utils/chatStorage";

const N8N_WEBHOOK_URL = import.meta.env.DEV
  ? "/api/chat"
  : import.meta.env.VITE_N8N_WEBHOOK_URL;

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

export function useN8nChat(initialChats?: Chat[]): UseN8nChatReturn {
  // ── Inicializar desde localStorage o fallback ──────────────────
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = loadChats();
    if (saved.length > 0) return saved;
    if (initialChats && initialChats.length > 0) return initialChats;
    return [createNewChat()];
  });

  const [activeChat, setActiveChat] = useState<string>(() => {
    const savedActive = loadActiveChatId();
    if (savedActive && chats.some((c) => c.id === savedActive)) {
      return savedActive;
    }
    return chats[0]?.id ?? createNewChat().id;
  });

  const [isTyping, setIsTyping] = useState(false);

  // ── Persistir cambios ─────────────────────────────────────────
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChatId(activeChat);
  }, [activeChat]);

  // ── Resto de la lógica ────────────────────────────────────────
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

  // 🔁 Nuevo: nunca permitir que la lista de chats quede vacía
  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          // Si no quedan chats, creamos uno nuevo automáticamente
          const newChat = createNewChat();
          setActiveChat(newChat.id);
          return [newChat];
        }
        if (activeChat === id) {
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

      // 🛡️ Protección: si el chat activo ya no existe, crear uno nuevo
      let currentChatId = activeChat;
      if (!chats.some((c) => c.id === currentChatId)) {
        const newChat = createNewChat();
        setChats((prev) => [...prev, newChat]);
        setActiveChat(newChat.id);
        currentChatId = newChat.id;
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      addMessage(currentChatId, userMsg);
      setIsTyping(true);

      try {
        if (!N8N_WEBHOOK_URL) throw new Error("VITE_N8N_WEBHOOK_URL no definida");

        const payload: N8nPayload = {
          action: "sendMessage",
          sessionId: currentChatId, // 👈 Usamos el ID seguro
          chatInput: content.trim(),
          pregunta: content.trim(),
        };

        console.log("📤 Enviando mensaje con sessionId:", currentChatId);

        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // ── Leer respuesta como texto primero para evitar errores de parseo ──
        const textResponse = await res.text();
        console.log("📡 Status:", res.status, "| Body length:", textResponse.length);

        if (!res.ok) {
          let errorMsg = `n8n error ${res.status}`;
          if (textResponse) {
            try {
              const errorJson = JSON.parse(textResponse);
              errorMsg = errorJson.message || errorJson.error || errorMsg;
            } catch {
              // No es JSON, usar los primeros 200 caracteres
              if (textResponse.length <= 200) {
                errorMsg = textResponse;
              }
            }
            console.error("📡 Error body:", textResponse.substring(0, 200));
          }
          throw new Error(errorMsg);
        }

        // Si la respuesta está vacía, tirar error claro
        if (!textResponse || textResponse.trim() === "") {
          throw new Error(
            "El servidor respondió con una respuesta vacía. Probablemente n8n tardó demasiado o hubo un error interno. Reintentá por favor."
          );
        }

        // Parsear JSON de forma segura
        let raw: any;
        try {
          raw = JSON.parse(textResponse);
        } catch (parseError) {
          console.error("📡 No es JSON válido:", textResponse.substring(0, 200));
          throw new Error(
            "El servidor respondió en un formato no válido. Reintentá por favor."
          );
        }

        console.log("🔴 RAW n8n response:", JSON.stringify(raw, null, 2));
        const normalized = Array.isArray(raw) ? raw[0] : raw;

        let textValue: string =
          typeof normalized === "string"
            ? normalized
            : normalized.respuesta ??
              normalized.output ??
              normalized.text ??
              normalized.message ??
              JSON.stringify(normalized);

        const mdJsonMatch = textValue.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (mdJsonMatch) {
          try {
            const inner = JSON.parse(mdJsonMatch[1].trim());
            textValue =
              inner.respuesta ??
              inner.output ??
              inner.text ??
              inner.message ??
              JSON.stringify(inner);
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
            const cParam = urlObj.searchParams.get("c");
            if (cParam) {
              let fixedJson = decodeURIComponent(cParam);
              fixedJson = fixedJson.replace(
                /"font"\s*:\s*"weight"\s*:\s*"(\w+)"\s*,\s*"size"\s*:\s*(\d+)/g,
                '"font":{"weight":"$1","size":$2}'
              );
              urlObj.searchParams.set("c", fixedJson);
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
        addMessage(currentChatId, assistantMsg);
      } catch (err) {
        const errorObj = err as Error;
        console.error("❌ Error en sendMessage:", errorObj.message);
        
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ Error al conectar con el agente: ${errorObj.message}`,
          timestamp: new Date(),
        };
        addMessage(currentChatId, errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [activeChat, chats, addMessage]
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