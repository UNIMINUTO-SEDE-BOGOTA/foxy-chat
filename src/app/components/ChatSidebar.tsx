// src/app/components/ChatSidebar.tsx
import { MessageSquare, Plus, Search, Trash2, Settings, HelpCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
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
        className="rounded-full h-8 w-8 lg-btn"
        title="Configuración"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-10 z-50 w-52 rounded-xl lg-menu shadow-lg overflow-hidden"
          >
            <div className="px-3 py-2 border-b lg-divider-border">
              <p className="text-xs lg-text-muted font-medium uppercase tracking-wide">Configuración</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => { setOpen(false); window.location.reload(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm lg-text-secondary hover:bg-white/10 dark:hover:bg-white/10 hover:bg-black/5 transition-colors text-left"
              >
                <RefreshCw className="w-4 h-4 lg-text-muted flex-shrink-0" />
                <span>Reiniciar aplicación</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChatSidebar({
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isDark,
  onThemeToggle,
  onHelpClick,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="hidden md:flex w-80 flex-col lg-sidebar"
      style={{ height: "100dvh" }}
    >
      {/* Header */}
      <div className="p-4 lg-divider-border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e15e29] to-[#d1b742] flex items-center justify-center shadow-lg shadow-[#e15e29]/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h2 className="lg-text-primary font-semibold tracking-wide">FOXY</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="icon"
              className="rounded-full h-8 w-8 lg-btn"
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
          className="w-full lg-btn-primary group"
        >
          <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
          Nuevo Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 lg-divider-border-b flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 lg-text-muted" />
          <Input
            data-tour="search"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 lg-input"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {filteredChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="lg-text-muted text-sm">No hay conversaciones</p>
              </motion.div>
            ) : (
              filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  layout
                >
                  <div
                    data-tour={index === 0 ? "chat-item" : undefined}
                    className={`group relative p-3 rounded-xl mb-2 cursor-pointer transition-all duration-300 ${
                      activeChat === chat.id
                        ? "lg-chat-active"
                        : "lg-chat hover:bg-white/5"
                    }`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#e15e29]/20 to-[#d1b742]/20 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-3 h-3 text-[#d1b742]" />
                          </div>
                          <h3 className="lg-text-primary font-medium truncate text-sm">
                            {chat.title}
                          </h3>
                        </div>

                        {/* Preview — clampado a 2 líneas, nunca estira la caja */}
                        <p
                          className="text-xs pl-8 lg-text-secondary"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: "1.45",
                          }}
                        >
                          {chat.preview}
                        </p>

                        <p className="text-xs lg-text-muted mt-1 pl-8">
                          {chat.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-7 w-7 rounded-lg hover:bg-red-500/20 flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>

                    {/* Shine on hover */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 h-12 lg-divider-border-t flex items-center justify-center">
        <p className="text-[10px] lg-text-muted tracking-wider">
          FOXY • Ecosistema de Inteligencia Institucional
        </p>
      </div>

      <style>{`
        /* ─── Tokens light/dark ─────────────────────────────────────── */

        /* Light - NUEVO: Fondo azul celeste, textos neutros, contenedores blancos */
        :root,
        .light {
          --sb-bg:               #eef5f5;
          --sb-border:           rgba(0, 139, 139, 0.15);
          --sb-text-primary:     #1a1a1a;
          --sb-text-secondary:   #555555;
          --sb-text-muted:       #999999;
          --sb-input-bg:         #ffffff;
          --sb-input-border:     rgba(0, 139, 139, 0.20);
          --sb-input-focus:      rgba(225, 94, 41, 0.12);
          --sb-btn-bg:           #f5f5f5;
          --sb-btn-border:       rgba(209, 183, 66, 0.25);
          --sb-btn-hover:        rgba(225, 94, 41, 0.08);
          --sb-divider:          rgba(0, 0, 0, 0.06);
          --sb-chat-bg:          #ffffff;
          --sb-chat-hover:       #fafafa;
          --sb-chat-active-from: rgba(225, 94, 41, 0.06);
          --sb-chat-active-to:   rgba(209, 183, 66, 0.04);
          --sb-chat-active-bdr:  rgba(225, 94, 41, 0.30);
          --sb-menu-bg:          #ffffff;
          --sb-radial:           radial-gradient(
                                   ellipse at 20% 30%,
                                   rgba(225, 94, 41, 0.04) 0%,
                                   rgba(209, 183, 66, 0.03) 40%,
                                   rgba(0, 139, 139, 0.06) 70%,
                                   transparent 100%
                                 );
        }

        /* Dark - SIN CAMBIOS, se mantiene igual */
        .dark {
          --sb-bg:               rgba(10, 22, 40, 0.82);
          --sb-border:           rgba(209, 183, 66, 0.15);
          --sb-text-primary:     rgba(255, 255, 255, 0.90);
          --sb-text-secondary:   rgba(255, 255, 255, 0.55);
          --sb-text-muted:       rgba(255, 255, 255, 0.30);
          --sb-input-bg:         rgba(255, 255, 255, 0.05);
          --sb-input-border:     rgba(209, 183, 66, 0.20);
          --sb-input-focus:      rgba(209, 183, 66, 0.20);
          --sb-btn-bg:           rgba(255, 255, 255, 0.03);
          --sb-btn-border:       rgba(209, 183, 66, 0.20);
          --sb-btn-hover:        rgba(209, 183, 66, 0.15);
          --sb-divider:          rgba(255, 255, 255, 0.10);
          --sb-chat-hover:       rgba(255, 255, 255, 0.05);
          --sb-chat-active-from: rgba(225, 94, 41, 0.12);
          --sb-chat-active-to:   rgba(209, 183, 66, 0.08);
          --sb-chat-active-bdr:  rgba(209, 183, 66, 0.30);
          --sb-menu-bg:          rgba(10, 22, 40, 0.96);
          --sb-radial:           radial-gradient(
                                   ellipse at 20% 30%,
                                   rgba(225, 94, 41, 0.08) 0%,
                                   rgba(0, 139, 139, 0.04) 40%,
                                   rgba(209, 183, 66, 0.06) 70%,
                                   transparent 100%
                                 );
        }

        /* ─── Componentes usando tokens ────────────────────────────── */

        /* Sidebar base */
        .lg-sidebar {
          background: var(--sb-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--sb-border);
          box-shadow: 4px 0 30px rgba(0, 0, 0, 0.08);
          position: relative;
        }
        .lg-sidebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--sb-radial);
          pointer-events: none;
          z-index: 0;
        }
        .lg-sidebar > * {
          position: relative;
          z-index: 1;
        }

        /* Texto */
        .lg-text-primary   { color: var(--sb-text-primary); }
        .lg-text-secondary { color: var(--sb-text-secondary); }
        .lg-text-muted     { color: var(--sb-text-muted); }

        /* Divisores */
        .lg-divider-border   { border: 0.5px solid var(--sb-divider); }
        .lg-divider-border-b { border-bottom: 0.5px solid var(--sb-divider); }
        .lg-divider-border-t { border-top:    0.5px solid var(--sb-divider); }

        /* Botones icon */
        .lg-btn {
          background: var(--sb-btn-bg) !important;
          border: 0.5px solid var(--sb-btn-border) !important;
          color: var(--sb-text-secondary) !important;
          backdrop-filter: blur(4px);
          transition: all 0.25s ease;
        }
        .lg-btn:hover {
          background: var(--sb-btn-hover) !important;
          border-color: rgba(209, 183, 66, 0.45) !important;
          transform: scale(1.05);
        }

        /* Botón primario */
        .lg-btn-primary {
          background: linear-gradient(135deg, rgba(225,94,41,0.88), rgba(209,183,66,0.88)) !important;
          backdrop-filter: blur(10px);
          border: 0.5px solid rgba(255, 255, 255, 0.20) !important;
          color: white !important;
          font-weight: 500;
          transition: all 0.25s ease;
          box-shadow: 0 2px 10px rgba(225, 94, 41, 0.18);
        }
        .lg-btn-primary:hover {
          background: linear-gradient(135deg, rgba(225,94,41,0.98), rgba(209,183,66,0.98)) !important;
          transform: translateY(-1px);
          box-shadow: 0 5px 18px rgba(225, 94, 41, 0.32) !important;
        }

        /* Input de búsqueda */
        .lg-input {
          background: var(--sb-input-bg) !important;
          backdrop-filter: blur(4px);
          border: 0.5px solid var(--sb-input-border) !important;
          color: var(--sb-text-primary) !important;
          transition: all 0.25s ease;
        }
        .lg-input:focus {
          background: var(--sb-input-bg) !important;
          border-color: rgba(209, 183, 66, 0.55) !important;
          box-shadow: 0 0 0 3px var(--sb-input-focus) !important;
        }
        .lg-input::placeholder {
          color: var(--sb-text-muted) !important;
        }

        /* Item de chat — estado normal */
        .lg-chat {
          background: transparent;
          border: 0.5px solid transparent;
          transition: all 0.25s ease;
        }
        .lg-chat:hover {
          background: var(--sb-chat-hover) !important;
          border-color: rgba(209, 183, 66, 0.18) !important;
          transform: translateX(2px);
        }

        /* Item de chat — activo */
        .lg-chat-active {
          background: linear-gradient(
            135deg,
            var(--sb-chat-active-from),
            var(--sb-chat-active-to)
          );
          border: 0.5px solid var(--sb-chat-active-bdr);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        /* Menú flotante settings */
        .lg-menu {
          background: var(--sb-menu-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 0.5px solid var(--sb-border);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        /* Scrollbar */
        .lg-sidebar ::-webkit-scrollbar       { width: 4px; }
        .lg-sidebar ::-webkit-scrollbar-track { background: transparent; }
        .lg-sidebar ::-webkit-scrollbar-thumb {
          background: var(--sb-divider);
          border-radius: 4px;
        }
        .lg-sidebar ::-webkit-scrollbar-thumb:hover {
          background: rgba(209, 183, 66, 0.40);
        }

        /* Animación de brillo líquido */
        @keyframes liquidShine {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </div>
  );
}