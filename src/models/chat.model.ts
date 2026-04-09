// src/models/chat.model.ts

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  chartUrl?: string; // URL de gráfica si la IA devuelve una imagen
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
}

export function generateSessionId(): string {
  const prefix = import.meta.env.VITE_CHAT_SESSION_PREFIX ?? "chat";
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createNewChat(): Chat {
  return {
    id: generateSessionId(),
    title: "Nueva conversación",
    timestamp: new Date(),
    preview: "Inicia una conversación con el asistente...",
    messages: [],
  };
}

export interface N8nPayload {
  action: "sendMessage";
  sessionId: string;
  chatInput: string;
  pregunta: string;
}