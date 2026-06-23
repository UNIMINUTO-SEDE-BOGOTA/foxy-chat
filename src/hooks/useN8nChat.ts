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

// ── Mapa de errores genéricos ──────────────────────────────────
const ERROR_MESSAGES = {
  NETWORK: "Lo siento, Foxy está teniendo problemas de conexión en este momento. ¿Podrías intentarlo de nuevo?",
  TIMEOUT: "Foxy está pensando, pero ha tomado más tiempo de lo esperado. Por favor, inténtalo nuevamente.",
  SERVER: "Foxy está experimentando dificultades técnicas. Por favor, intenta reformular tu pregunta.",
  EMPTY_RESPONSE: "Foxy no pudo generar una respuesta. Intenta ser más específico en tu consulta.",
  PARSE: "Foxy respondió en un formato no reconocido. Por favor, intenta nuevamente.",
  DEFAULT: "Lo siento, Foxy no puede resolver tu duda en este momento. ¿Podrías ser más específico?",
  N8N_ERROR: "Foxy está teniendo un mal día. Por favor, intenta con una pregunta más concreta.",
};

// ── Función para obtener mensaje genérico según tipo de error ──
function getGenericErrorMessage(error: Error): string {
  const message = error.message.toLowerCase();
  
  // Errores de red
  if (message.includes("failed to fetch") || 
      message.includes("network") || 
      message.includes("connection") ||
      message.includes("econnrefused") ||
      message.includes("econnreset")) {
    return ERROR_MESSAGES.NETWORK;
  }
  
  // Timeout
  if (message.includes("timeout") || 
      message.includes("timed out") ||
      message.includes("aborted")) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  // Error del servidor
  if (message.includes("500") || 
      message.includes("502") || 
      message.includes("503") ||
      message.includes("504") ||
      message.includes("internal server")) {
    return ERROR_MESSAGES.SERVER;
  }
  
  // Respuesta vacía
  if (message.includes("vacía") || 
      message.includes("empty") ||
      message.includes("no se recibió")) {
    return ERROR_MESSAGES.EMPTY_RESPONSE;
  }
  
  // Error de parseo
  if (message.includes("parse") || 
      message.includes("json") ||
      message.includes("formato") ||
      message.includes("format")) {
    return ERROR_MESSAGES.PARSE;
  }
  
  // Error específico de n8n
  if (message.includes("n8n")) {
    return ERROR_MESSAGES.N8N_ERROR;
  }
  
  // Error genérico
  return ERROR_MESSAGES.DEFAULT;
}

// ── Función para sanitizar logs (remover sessionId) ────────────
function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  // Si es un objeto, clonarlo y eliminar sessionId
  if (typeof data === 'object') {
    const sanitized = { ...data };
    delete sanitized.sessionId;
    // También revisar si hay campos anidados
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeLogData(sanitized[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

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

  // Nuevo: nunca permitir que la lista de chats quede vacía
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

      // Protección: si el chat activo ya no existe, crear uno nuevo
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
        if (!N8N_WEBHOOK_URL) {
          throw new Error("VITE_N8N_WEBHOOK_URL no definida");
        }

        const payload: N8nPayload = {
          action: "sendMessage",
          sessionId: currentChatId,
          chatInput: content.trim(),
          pregunta: content.trim(),
        };

        const res = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // ── Leer respuesta como texto primero para evitar errores de parseo ──
        const textResponse = await res.text();
        console.log("📡 Status:", res.status, "| Body length:", textResponse.length);

        if (!res.ok) {
          let errorDetails = `n8n error ${res.status}`;
          if (textResponse) {
            try {
              const errorJson = JSON.parse(textResponse);
              errorDetails = errorJson.message || errorJson.error || errorDetails;
            } catch {
              // No es JSON, usar los primeros 200 caracteres
              if (textResponse.length <= 200) {
                errorDetails = textResponse;
              }
            }
            console.error("📡 Error body:", textResponse.substring(0, 200));
          }
          
          // ✅ Log del error real en consola (sin sessionId)
          console.error("❌ Error real de n8n:", {
            status: res.status,
            statusText: res.statusText,
            details: errorDetails,
            fullResponse: textResponse.substring(0, 500)
          });
          
          throw new Error(errorDetails);
        }

        // Si la respuesta está vacía, tirar error claro
        if (!textResponse || textResponse.trim() === "") {
          const emptyError = new Error(
            "El servidor respondió con una respuesta vacía. Probablemente n8n tardó demasiado o hubo un error interno."
          );
          console.error("❌ Error real: Respuesta vacía de n8n");
          throw emptyError;
        }

        // Parsear JSON de forma segura
        let raw: any;
        try {
          raw = JSON.parse(textResponse);
        } catch (parseError) {
          console.error("❌ Error real de parseo JSON:", {
            error: parseError,
            response: textResponse.substring(0, 500)
          });
          throw new Error("El servidor respondió en un formato no válido. Reintentá por favor.");
        }

        // ✅ Log sanitizado (sin sessionId)
        const sanitizedRaw = sanitizeLogData(raw);
        console.log("🔴 RAW n8n response (sanitizado):", JSON.stringify(sanitizedRaw, null, 2));
        
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
        
        // ✅ Log del error real en consola con todos los detalles (sin sessionId)
        console.group("❌ Error en Foxy - Detalles completos");
        console.error("Mensaje de error:", errorObj.message);
        console.error("Stack trace:", errorObj.stack);
        console.error("Timestamp:", new Date().toISOString());
        console.error("URL:", N8N_WEBHOOK_URL);
        console.groupEnd();
        
        // ✅ También imprimir el error en formato simple para rápida visualización
        console.error("❌ Error real (simplificado):", errorObj.message);
        
        // ── Obtener mensaje genérico para el usuario ──
        const genericMessage = getGenericErrorMessage(errorObj);
        console.log("💬 Mensaje mostrado al usuario:", genericMessage);
        
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: genericMessage,
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