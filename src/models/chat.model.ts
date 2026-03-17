// src/models/chat.model.ts

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;          // sessionId que va a n8n  → "chat_<uuid>"
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[]; // historial completo
}

/** Genera un sessionId único con prefijo configurable via .env */
export function generateSessionId(): string {
  const prefix = import.meta.env.VITE_CHAT_SESSION_PREFIX ?? "chat";
  return `${prefix}_${crypto.randomUUID()}`;
}

/** Crea un Chat nuevo vacío */
export function createNewChat(): Chat {
  return {
    id: generateSessionId(),
    title: "Nueva conversación",
    timestamp: new Date(),
    preview: "Inicia una conversación con el asistente...",
    messages: [],
  };
}

/** Payload que espera el webhook de n8n */
export interface N8nPayload {
  action: "sendMessage";
  sessionId: string;
  chatInput: string;
  pregunta: string; // fallback field
}