// src/utils/chatStorage.ts
import type { Chat } from "../models/chat.model";

const CHATS_KEY = "n8n_chats";
const ACTIVE_KEY = "n8n_active_chat";

export function loadChats(): Chat[] {
  try {
    const stored = localStorage.getItem(CHATS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Convertir timestamps de string a Date
    return parsed.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
      messages: c.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

export function saveChats(chats: Chat[]): void {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function loadActiveChatId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveChatId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}