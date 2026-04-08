// src/app/components/ChatSidebar.tsx
import { MessageSquare, Plus, Search, Trash2, Settings, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { motion } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useRef, useEffect } from "react";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onHelpClick: () => void;
}

function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost" size="icon"
        className="rounded-full h-8 w-8"
        title="Configuración"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-52 rounded-xl border border-sidebar-border bg-sidebar shadow-md overflow-hidden">
          <div className="px-3 py-2 border-b border-sidebar-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Configuración</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => { setOpen(false); window.location.reload(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Reiniciar aplicación</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatSidebar({
  chats, activeChat, onChatSelect, onNewChat,
  onDeleteChat, isDark, onThemeToggle, onHelpClick,
}: ChatSidebarProps) {
  return (
    <div className="hidden md:flex w-80 bg-sidebar border-r border-sidebar-border flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-sidebar-foreground">Agente IA</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="rounded-full h-8 w-8"
              title="Ayuda"
              onClick={onHelpClick}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <SettingsMenu />
            <span data-tour="theme-toggle">
              <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
            </span>
          </div>
        </div>

        <Button
          data-tour="new-chat"
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-tour="search"
            placeholder="Buscar conversaciones..."
            className="pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {chats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                data-tour={index === 0 ? "chat-item" : undefined}
                className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  activeChat === chat.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sidebar-foreground truncate mb-1">{chat.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{chat.preview}</p>
                    <p className="text-xs text-muted-foreground mt-1">{chat.timestamp.toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer vacío — reservado para uso futuro */}
      <div className="flex-shrink-0 h-2 border-t border-sidebar-border" />
    </div>
  );
}