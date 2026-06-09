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
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="lg-menu"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 50,
              width: "200px",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(160,200,220,0.45)", margin: 0 }}>
                Configuración
              </p>
            </div>
            <div style={{ padding: "4px" }}>
              <button
                onClick={() => { setOpen(false); window.location.reload(); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "rgba(196,222,240,0.85)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.18s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <RefreshCw style={{ width: "14px", height: "14px", flexShrink: 0, color: "rgba(160,200,220,0.50)" }} />
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
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {/* Header */}
      <div className="p-4 lg-divider-border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="foxy-mark">
              <div className="foxy-dot" />
              <span className="foxy-name">Foxy</span>
            </div>
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
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="p-2" style={{ width: "100%", boxSizing: "border-box" }}>
          <p className="section-label">Recientes</p>
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
                  style={{ width: "100%", minWidth: 0 }}
                >
                  <div
                    data-tour={index === 0 ? "chat-item" : undefined}
                    className={`group relative p-3 rounded-xl mb-1.5 cursor-pointer transition-all duration-300 ${
                      activeChat === chat.id ? "lg-chat-active" : "lg-chat"
                    }`}
                    style={{ width: "100%", boxSizing: "border-box", overflow: "hidden" }}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-start justify-between gap-2" style={{ minWidth: 0 }}>
                      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", minWidth: 0, overflow: "hidden" }}>
                          <div className="chat-icon-wrap" style={{ flexShrink: 0 }}>
                            <MessageSquare className="w-3 h-3" />
                          </div>
                          <h3
                            className="lg-text-primary font-medium text-sm"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1 }}
                          >
                            {chat.title}
                          </h3>
                        </div>

                        <p
                          className="text-xs lg-text-secondary"
                          style={{
                            paddingLeft: "32px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: "1.45",
                          }}
                        >
                          {chat.preview}
                        </p>

                        <p className="text-xs lg-text-muted mt-1" style={{ paddingLeft: "32px" }}>
                          {chat.timestamp.toLocaleDateString()}
                        </p>
                      </div>

                      {/* Active indicator dot */}
                      {activeChat === chat.id && (
                        <div className="active-dot" style={{ flexShrink: 0, marginTop: "4px" }} />
                      )}

                      <Button
                        variant="ghost" size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-7 w-7 rounded-lg hover:bg-red-500/20"
                        style={{ flexShrink: 0 }}
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>

                    {/* Shimmer on hover */}
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
      <div className="flex-shrink-0 h-12 lg-divider-border-t flex items-center justify-center gap-2">
        <div className="footer-line" />
        <p className="footer-text">Ecosistema de Inteligencia Institucional</p>
        <div className="footer-line" />
      </div>

      <style>{`
        /* ─── Paleta de chart colors ──────────────────────────────────── */
        :root {
          --c1: #008B8B;
          --c2: #2E5871;
          --c3: #D1B742;
          --c4: #bf6962;
          --c5: #b8cc70;
        }

        /* ─── LIGHT MODE ─────────────────────────────────────────────── */
        :root,
        .light {
          --sb-bg-base:        linear-gradient(155deg, #1e3a4a 0%, #1a3040 35%, #162438 65%, #0f1e2e 100%);
          --sb-radial:
            radial-gradient(ellipse at 15% 0%,   rgba(0,139,139,0.55) 0%, transparent 45%),
            radial-gradient(ellipse at 88% 8%,   rgba(209,183,66,0.22) 0%, transparent 38%),
            radial-gradient(ellipse at 4%  80%,  rgba(191,105,98,0.22) 0%, transparent 42%),
            radial-gradient(ellipse at 90% 92%,  rgba(184,204,112,0.14) 0%, transparent 38%);
          --sb-border:         rgba(255,255,255,0.10);
          --sb-shine:          linear-gradient(90deg, transparent, rgba(255,255,255,0.20), rgba(209,183,66,0.15), transparent);

          --sb-text-primary:   #e4f0f8;
          --sb-text-secondary: rgba(196,222,240,0.78);
          --sb-text-muted:     rgba(160,200,220,0.45);

          --sb-divider:        rgba(255,255,255,0.07);

          --sb-input-bg:       rgba(255,255,255,0.07);
          --sb-input-border:   rgba(255,255,255,0.11);
          --sb-input-focus-bdr:rgba(0,200,200,0.50);
          --sb-input-focus-glow:rgba(0,139,139,0.14);

          --sb-btn-bg:         rgba(255,255,255,0.07);
          --sb-btn-border:     rgba(255,255,255,0.10);
          --sb-btn-hover-bg:   rgba(0,139,139,0.18);
          --sb-btn-hover-bdr:  rgba(0,139,139,0.32);

          --sb-btn-primary:    linear-gradient(130deg, #2E5871 0%, #bf6962 55%, #D1B742 100%);
          --sb-btn-primary-shadow: 0 6px 20px rgba(191,105,98,0.30), inset 0 1px 0 rgba(255,255,255,0.22);
          --sb-btn-primary-hover-shadow: 0 10px 28px rgba(191,105,98,0.42), inset 0 1px 0 rgba(255,255,255,0.28);

          --sb-chat-bg:        rgba(255,255,255,0.05);
          --sb-chat-border:    rgba(255,255,255,0.07);
          --sb-chat-hover-bg:  rgba(255,255,255,0.10);
          --sb-chat-hover-bdr: rgba(0,139,139,0.25);
          --sb-chat-active-bg: rgba(0,139,139,0.18);
          --sb-chat-active-bdr:rgba(0,180,180,0.38);
          --sb-chat-active-shadow: 0 4px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.07);

          --sb-active-dot:     #008B8B;
          --sb-active-dot-glow:rgba(0,139,139,0.60);

          --sb-icon-bg:        rgba(0,139,139,0.20);
          --sb-icon-border-active: rgba(0,139,139,0.35);

          --sb-menu-bg:        rgba(15,30,48,0.96);
          --sb-menu-border:    rgba(255,255,255,0.10);
          --sb-menu-shadow:    0 16px 48px rgba(0,0,0,0.40);

          --sb-scrollbar:      rgba(0,139,139,0.22);
          --sb-footer-line:    linear-gradient(90deg, transparent, rgba(0,139,139,0.20), transparent);
          --sb-section-color:  rgba(160,200,220,0.38);
        }

        /* ─── DARK MODE ──────────────────────────────────────────────── */
        .dark {
          --sb-bg-base:        linear-gradient(160deg, rgba(6,14,28,0.97) 0%, rgba(8,18,36,0.96) 50%, rgba(10,20,32,0.97) 100%);
          --sb-radial:
            radial-gradient(ellipse at 15% 0%,   rgba(0,139,139,0.16) 0%, transparent 50%),
            radial-gradient(ellipse at 88% 10%,  rgba(209,183,66,0.09) 0%, transparent 40%),
            radial-gradient(ellipse at 3%  78%,  rgba(191,105,98,0.09) 0%, transparent 45%),
            radial-gradient(ellipse at 92% 93%,  rgba(184,204,112,0.05) 0%, transparent 36%);
          --sb-border:         rgba(255,255,255,0.06);
          --sb-shine:          linear-gradient(90deg, transparent, rgba(255,255,255,0.07), rgba(209,183,66,0.10), transparent);

          --sb-text-primary:   #e0ecf8;
          --sb-text-secondary: rgba(190,215,235,0.72);
          --sb-text-muted:     rgba(140,180,205,0.40);

          --sb-divider:        rgba(255,255,255,0.06);

          --sb-input-bg:       rgba(255,255,255,0.04);
          --sb-input-border:   rgba(255,255,255,0.08);
          --sb-input-focus-bdr:rgba(0,139,139,0.50);
          --sb-input-focus-glow:rgba(0,139,139,0.10);

          --sb-btn-bg:         rgba(255,255,255,0.04);
          --sb-btn-border:     rgba(255,255,255,0.07);
          --sb-btn-hover-bg:   rgba(209,183,66,0.10);
          --sb-btn-hover-bdr:  rgba(209,183,66,0.22);

          --sb-btn-primary:    linear-gradient(130deg, #2E5871 0%, #bf6962 55%, #D1B742 100%);
          --sb-btn-primary-shadow: 0 6px 20px rgba(191,105,98,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
          --sb-btn-primary-hover-shadow: 0 10px 28px rgba(191,105,98,0.38), inset 0 1px 0 rgba(255,255,255,0.24);

          --sb-chat-bg:        rgba(255,255,255,0.03);
          --sb-chat-border:    rgba(255,255,255,0.05);
          --sb-chat-hover-bg:  rgba(255,255,255,0.07);
          --sb-chat-hover-bdr: rgba(0,139,139,0.20);
          --sb-chat-active-bg: rgba(0,139,139,0.14);
          --sb-chat-active-bdr:rgba(0,139,139,0.34);
          --sb-chat-active-shadow: 0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05);

          --sb-active-dot:     #008B8B;
          --sb-active-dot-glow:rgba(0,139,139,0.50);

          --sb-icon-bg:        rgba(0,139,139,0.14);
          --sb-icon-border-active: rgba(0,139,139,0.28);

          --sb-menu-bg:        rgba(6,14,28,0.97);
          --sb-menu-border:    rgba(255,255,255,0.07);
          --sb-menu-shadow:    0 16px 48px rgba(0,0,0,0.55);

          --sb-scrollbar:      rgba(209,183,66,0.16);
          --sb-footer-line:    linear-gradient(90deg, transparent, rgba(209,183,66,0.12), transparent);
          --sb-section-color:  rgba(140,180,205,0.36);
        }

        /* ─── Sidebar base ───────────────────────────────────────────── */
        .lg-sidebar {
          background: var(--sb-radial), var(--sb-bg-base);
          backdrop-filter: blur(40px) saturate(160%);
          -webkit-backdrop-filter: blur(40px) saturate(160%);
          border-right: 1px solid var(--sb-border);
          position: relative;
          overflow: hidden;
        }

        .lg-sidebar::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: var(--sb-shine);
          pointer-events: none;
          z-index: 0;
        }

        .lg-sidebar > * { position: relative; z-index: 1; }

        /* ─── FIX: ScrollArea de Radix no desborda horizontalmente ──── */
        .lg-sidebar [data-radix-scroll-area-viewport] {
          overflow-x: hidden !important;
        }

        .lg-sidebar [data-radix-scroll-area-viewport] > div {
          display: block !important;
          width: 100% !important;
          min-width: 0 !important;
        }

        /* ─── Foxy mark ──────────────────────────────────────────────── */
        .foxy-mark {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .foxy-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D1B742, #b8cc70);
          opacity: 0.75;
        }

        .foxy-name {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--sb-text-muted);
        }

        /* ─── Section label ──────────────────────────────────────────── */
        .section-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--sb-section-color);
          padding: 4px 6px 8px;
        }

        /* ─── Texto ──────────────────────────────────────────────────── */
        .lg-text-primary   { color: var(--sb-text-primary); }
        .lg-text-secondary { color: var(--sb-text-secondary); }
        .lg-text-muted     { color: var(--sb-text-muted); }

        /* ─── Divisores ──────────────────────────────────────────────── */
        .lg-divider-border   { border: 1px solid var(--sb-divider); }
        .lg-divider-border-b { border-bottom: 1px solid var(--sb-divider); }
        .lg-divider-border-t { border-top: 1px solid var(--sb-divider); }

        /* ─── Botones icono ──────────────────────────────────────────── */
        .lg-btn {
          background: var(--sb-btn-bg) !important;
          border: 1px solid var(--sb-btn-border) !important;
          color: var(--sb-text-secondary) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lg-btn:hover {
          background: var(--sb-btn-hover-bg) !important;
          border-color: var(--sb-btn-hover-bdr) !important;
          transform: translateY(-1px);
        }

        /* ─── Botón primario ─────────────────────────────────────────── */
        .lg-btn-primary {
          background: var(--sb-btn-primary) !important;
          border: 1px solid rgba(255,255,255,0.20) !important;
          color: white !important;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--sb-btn-primary-shadow);
          position: relative;
          overflow: hidden;
        }

        .lg-btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transition: left 0.50s ease;
        }

        .lg-btn-primary:hover::before { left: 100%; }

        .lg-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--sb-btn-primary-hover-shadow) !important;
        }

        /* ─── Input búsqueda ─────────────────────────────────────────── */
        .lg-input {
          background: var(--sb-input-bg) !important;
          border: 1px solid var(--sb-input-border) !important;
          color: var(--sb-text-primary) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.25s ease;
        }

        .lg-input::placeholder { color: var(--sb-text-muted) !important; }

        .lg-input:focus {
          border-color: var(--sb-input-focus-bdr) !important;
          box-shadow: 0 0 0 3px var(--sb-input-focus-glow) !important;
          outline: none;
        }

        /* ─── Chat items ─────────────────────────────────────────────── */
        .lg-chat {
          background: var(--sb-chat-bg);
          border: 1px solid var(--sb-chat-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .lg-chat:hover {
          background: var(--sb-chat-hover-bg) !important;
          border-color: var(--sb-chat-hover-bdr) !important;
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .lg-chat-active {
          background: var(--sb-chat-active-bg) !important;
          border: 1px solid var(--sb-chat-active-bdr) !important;
          box-shadow: var(--sb-chat-active-shadow) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        /* Chat icon wrap */
        .chat-icon-wrap {
          width: 24px; height: 24px;
          border-radius: 7px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.11);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sb-text-secondary);
          flex-shrink: 0;
        }

        .lg-chat-active .chat-icon-wrap {
          background: var(--sb-icon-bg);
          border-color: var(--sb-icon-border-active);
          color: #008B8B;
        }

        /* Active dot */
        .active-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--sb-active-dot);
          box-shadow: 0 0 6px var(--sb-active-dot-glow);
          flex-shrink: 0;
        }

        /* ─── Menú flotante ──────────────────────────────────────────── */
        .lg-menu {
          background: var(--sb-menu-bg);
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid var(--sb-menu-border);
          box-shadow: var(--sb-menu-shadow);
        }

        /* ─── Footer ─────────────────────────────────────────────────── */
        .footer-line {
          height: 1px;
          flex: 1;
          background: var(--sb-footer-line);
        }

        .footer-text {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: var(--sb-text-muted);
          opacity: 0.55;
          white-space: nowrap;
        }

        /* ─── Scrollbar ──────────────────────────────────────────────── */
        .lg-sidebar ::-webkit-scrollbar       { width: 4px; }
        .lg-sidebar ::-webkit-scrollbar-track { background: transparent; }
        .lg-sidebar ::-webkit-scrollbar-thumb {
          background: var(--sb-scrollbar);
          border-radius: 2px;
        }
        .lg-sidebar ::-webkit-scrollbar-thumb:hover {
          background: rgba(0,139,139,0.38);
        }
      `}</style>
    </div>
  );
}