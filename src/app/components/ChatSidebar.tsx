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
            className="absolute left-0 top-10 z-[9999] w-52 rounded-xl lg-menu shadow-lg overflow-hidden"
          >
            <div className="px-3 py-2 border-b lg-divider-border">
              <p className="text-xs lg-text-muted font-medium uppercase tracking-wide">Configuración</p>
            </div>
            <div className="p-1">
              <button
                onClick={() => { setOpen(false); window.location.reload(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm lg-text-secondary hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
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
                        : "lg-chat"
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

        /* Light - Fondo azul celeste, letras NEGRAS/GRISES */

        :root,
.light {
  /* Paleta Premium - Alineada con chart colors */
  --color-teal: #008B8B;
  --color-blue-dark: #2E5871;
  --color-gold: #D1B742;
  --color-coral: #bf6962;
  --color-lime: #b8cc70;

  /* Fondo: Liquid Glass Premium - Color sólido elegante */
  --sb-bg: #f5f7fa;

  /* Bordes Premium - Alineados con paleta */
  --sb-border: rgba(0, 139, 139, 0.30);
  --sb-border-light: rgba(0, 139, 139, 0.15);
  --sb-border-accent: rgba(191, 105, 98, 0.25);

  /* Textos */
  --sb-text-primary: #1a1a1a;
  --sb-text-secondary: #4a4a4a;
  --sb-text-muted: #7a7a7a;

  /* Inputs - Glass Effect */
  --sb-input-bg: rgba(255, 255, 255, 0.88);
  --sb-input-border: rgba(0, 139, 139, 0.30);
  --sb-input-border-hover: rgba(0, 139, 139, 0.50);
  --sb-input-focus: rgba(191, 105, 98, 0.25);
  --sb-input-shadow: 0 8px 32px rgba(46, 88, 113, 0.12);

  /* Botones - Glass Icons */
  --sb-btn-bg: rgba(255, 255, 255, 0.70);
  --sb-btn-border: rgba(0, 139, 139, 0.25);
  --sb-btn-hover-bg: rgba(0, 139, 139, 0.12);
  --sb-btn-hover-border: rgba(0, 139, 139, 0.40);
  --sb-btn-shadow: 0 4px 15px rgba(46, 88, 113, 0.10);

  /* Botón Primario - Gradiente Paleta Completa */
  --sb-btn-primary: linear-gradient(135deg, #2E5871 0%, #bf6962 40%, #D1B742 100%);
  --sb-btn-primary-hover: linear-gradient(135deg, #1a3a50 0%, #a84a3a 40%, #c4a635 100%);
  /* Botón Primario - Sombra premium */
  --sb-btn-primary-shadow: 0 8px 24px rgba(191, 105, 98, 0.35);
  --sb-btn-primary-glow: 0 0 20px rgba(191, 105, 98, 0.25);

  /* Divisores Elegantes */
  --sb-divider: rgba(0, 139, 139, 0.15);
  --sb-divider-accent: rgba(191, 105, 98, 0.10);

  /* Chats - Glass Cards */
  --sb-chat-bg: rgba(255, 255, 255, 0.60);
  --sb-chat-bg-hover: rgba(255, 255, 255, 0.75);
  --sb-chat-border: rgba(0, 139, 139, 0.15);
  --sb-chat-border-hover: rgba(0, 139, 139, 0.30);
  --sb-chat-shadow: 0 2px 8px rgba(46, 88, 113, 0.05);
  --sb-chat-shadow-hover: 0 12px 32px rgba(46, 88, 113, 0.15);

  /* Chat Activo - Premium Gradient */
  --sb-chat-active-from: rgba(0, 139, 139, 0.20);
  --sb-chat-active-to: rgba(191, 105, 98, 0.12);
  --sb-chat-active-bdr: rgba(191, 105, 98, 0.40);
  --sb-chat-active-shadow: 0 12px 28px rgba(191, 105, 98, 0.18);

  /* Menú Flotante */
  --sb-menu-bg: rgba(255, 255, 255, 0.88);
  --sb-menu-border: rgba(0, 139, 139, 0.25);
  --sb-menu-shadow: 0 16px 48px rgba(46, 88, 113, 0.20);

  /* Efectos Decorativos - Reflejos Especulares */
  --sb-radial:
    radial-gradient(
      circle at 20% 0%,
      rgba(0, 139, 139, 0.20) 0%,
      transparent 35%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(191, 105, 98, 0.15) 0%,
      transparent 30%
    ),
    radial-gradient(
      circle at 10% 100%,
      rgba(209, 183, 66, 0.15) 0%,
      transparent 45%
    ),
    radial-gradient(
      circle at 100% 50%,
      rgba(0, 139, 139, 0.10) 0%,
      transparent 40%
    );
}

        /* Dark - SIN CAMBIOS */
        .dark {
          --sb-bg:               rgba(10, 22, 40, 0.82);
          --sb-border:           rgba(209, 183, 66, 0.15);
          --sb-text-primary:     #ffffff;
          --sb-text-secondary:   rgba(255, 255, 255, 0.70);
          --sb-text-muted:       rgba(255, 255, 255, 0.40);
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

        /* Sidebar base - Liquid Glass Premium */
        .lg-sidebar {
          background: var(--sb-bg);
          backdrop-filter: blur(18px) saturate(110%);
          -webkit-backdrop-filter: blur(18px) saturate(110%);
          border-right: 1px solid var(--sb-border);
          box-shadow: 
            -2px 0 32px rgba(10, 34, 64, 0.15),
            inset 1px 0 0 rgba(255, 255, 255, 0.15),
            inset -1px 0 0 rgba(10, 34, 64, 0.10);
          position: relative;
          overflow: hidden;
        }

        .lg-sidebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--sb-radial);
          pointer-events: none;
          z-index: 0;
        }

        .lg-sidebar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.25) 50%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        .lg-sidebar > * {
          position: relative;
          z-index: 1;
        }

        /* Texto - Premium */
        .lg-text-primary   { color: var(--sb-text-primary); font-weight: 600; }
        .lg-text-secondary { color: var(--sb-text-secondary); }
        .lg-text-muted     { color: var(--sb-text-muted); }

        /* Divisores Premium */
        .lg-divider-border   { border: 1px solid var(--sb-divider); }
        .lg-divider-border-b { border-bottom: 1px solid var(--sb-divider); }
        .lg-divider-border-t { border-top: 1px solid var(--sb-divider); }

        /* Botones icon - Unitono con fondo */
        .lg-btn {
          background: #f5f7fa !important;
          border: 1px solid rgba(0, 139, 139, 0.10) !important;
          color: var(--sb-text-primary) !important;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: none;
          font-weight: 500;
        }

        .lg-btn:hover {
          background: #f5f7fa !important;
          border-color: rgba(0, 139, 139, 0.20) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(46, 88, 113, 0.08) !important;
        }

        /* Dark mode - Botones unitono con fondo */
        .dark .lg-btn {
          background: rgba(10, 22, 40, 0.82) !important;
          border: 1px solid rgba(209, 183, 66, 0.10) !important;
        }

        .dark .lg-btn:hover {
          background: rgba(10, 22, 40, 0.82) !important;
          border-color: rgba(209, 183, 66, 0.20) !important;
        }

        /* Botón primario - Naranja → Dorado Premium */
        .lg-btn-primary {
          background: var(--sb-btn-primary) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          color: white !important;
          font-weight: 600;
          letter-spacing: 0.3px;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            var(--sb-btn-primary-shadow),
            var(--sb-btn-primary-glow),
            inset 0 1px 0 rgba(255, 255, 255, 0.30);
          position: relative;
          overflow: hidden;
        }

        .lg-btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.25),
            transparent
          );
          transition: left 0.6s ease;
        }

        .lg-btn-primary:hover::before {
          left: 100%;
        }

        .lg-btn-primary:hover {
          background: var(--sb-btn-primary-hover) !important;
          transform: translateY(-3px);
          box-shadow: 
            0 12px 32px rgba(191, 105, 98, 0.40),
            0 0 28px rgba(191, 105, 98, 0.30) !important;
        }

        /* Input de búsqueda - Glass */
        .lg-input {
          background: var(--sb-input-bg) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--sb-input-border) !important;
          color: var(--sb-text-primary) !important;
          transition: all 0.3s ease;
          box-shadow: var(--sb-input-shadow);
          font-weight: 500;
        }

        .lg-input:hover {
          border-color: var(--sb-input-border-hover) !important;
          background: rgba(255, 255, 255, 0.90) !important;
        }

        .lg-input:focus {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: #008B8B !important;
          box-shadow: 
            var(--sb-input-shadow),
            0 0 0 3px var(--sb-input-focus) !important;
          outline: none;
        }

        .lg-input::placeholder {
          color: var(--sb-text-muted) !important;
          opacity: 0.7;
        }

        /* Item de chat — estado normal - Glass Card */
        .lg-chat {
          background: var(--sb-chat-bg);
          border: 1px solid var(--sb-chat-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--sb-chat-shadow);
          position: relative;
          overflow: hidden;
        }

        .lg-chat::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.10) 0%,
            transparent 100%
          );
          pointer-events: none;
        }

        .lg-chat:hover {
          background: var(--sb-chat-bg-hover) !important;
          border-color: var(--sb-chat-border-hover) !important;
          transform: translateX(6px) translateY(-2px);
          box-shadow: var(--sb-chat-shadow-hover) !important;
        }

        /* Item de chat — activo - Premium Gradient */
        .lg-chat-active {
          background: linear-gradient(
            135deg,
            var(--sb-chat-active-from) 0%,
            var(--sb-chat-active-to) 100%
          ) !important;
          border: 1px solid var(--sb-chat-active-bdr) !important;
          box-shadow: 
            var(--sb-chat-active-shadow),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Menú flotante settings - Glass Premium */
        .lg-menu {
          background: var(--sb-menu-bg);
          backdrop-filter: blur(20px) saturate(110%);
          -webkit-backdrop-filter: blur(20px) saturate(110%);
          border: 1px solid var(--sb-menu-border);
          box-shadow: var(--sb-menu-shadow);
          border-radius: 12px;
        }

        /* Scrollbar - Elegante */
        .lg-sidebar ::-webkit-scrollbar { 
          width: 6px; 
        }

        .lg-sidebar ::-webkit-scrollbar-track { 
          background: transparent; 
        }

        .lg-sidebar ::-webkit-scrollbar-thumb {
          background: rgba(0, 139, 139, 0.25);
          border-radius: 3px;
          transition: background 0.3s ease;
        }

        .lg-sidebar ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 139, 139, 0.45);
        }

        /* Animaciones */
        @keyframes liquidShine {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}