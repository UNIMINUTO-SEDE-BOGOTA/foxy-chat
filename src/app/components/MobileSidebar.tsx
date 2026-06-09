// src/app/components/MobileSidebar.tsx
import { MessageSquare, Plus, Search, Trash2, Settings, HelpCircle, X, RefreshCw } from "lucide-react";
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  activeChat: string;
  onChatSelect: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onHelpClick: () => void;
  tourActive?: boolean;
}

// Reemplaza el componente SettingsMenu en MobileSidebar.tsx

function SettingsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost" size="icon"
        className="rounded-full h-8 w-8"
        title="Configuración"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </Button>

      {/* Panel anclado al fondo — nunca se corta */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-0 left-0 w-[280px] z-[80] bg-[#f5f7fa] dark:bg-[rgba(10,22,40,0.82)] border-t border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)] rounded-t-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle drag visual */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-4 py-2 border-b border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)] flex items-center justify-between">
              <p className="text-xs text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)] font-medium uppercase tracking-wide">Configuración</p>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)] hover:text-[#1a1a1a] dark:hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2">
              <button
                onClick={() => { setOpen(false); window.location.reload(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-[#1a1a1a] dark:text-white bg-[#f5f7fa] dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#f0f2f7] dark:hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(0,139,139,0.10)] dark:border-[rgba(209,183,66,0.10)] active:scale-[0.98] transition-all text-left"
              >
                <RefreshCw className="w-4 h-4 text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)] flex-shrink-0" />
                <span>Reiniciar aplicación</span>
              </button>
            </div>

            <div className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar tocando afuera */}
      {open && (
        <div
          className="fixed inset-0 z-[75]"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function MobileSidebar({
  isOpen, onClose, chats, activeChat,
  onChatSelect, onNewChat, onDeleteChat,
  isDark, onThemeToggle, onHelpClick, tourActive = false,
}: MobileSidebarProps) {
  const handleChatSelect = (id: string) => { onChatSelect(id); onClose(); };

  return (
    <>
      <style>{`
        /* Mobile Sidebar Estilos Premium */
        
        .mobile-btn-primary {
          background: linear-gradient(135deg, #2E5871 0%, #bf6962 40%, #D1B742 100%) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.25) !important;
          color: white !important;
          font-weight: 600;
          letter-spacing: 0.3px;
          box-shadow: 
            0 8px 24px rgba(191, 105, 98, 0.35),
            0 0 20px rgba(191, 105, 98, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.30);
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-btn-primary:hover {
          background: linear-gradient(135deg, #1a3a50 0%, #a84a3a 40%, #c4a635 100%) !important;
          transform: translateY(-3px);
          box-shadow: 
            0 12px 32px rgba(191, 105, 98, 0.40),
            0 0 28px rgba(191, 105, 98, 0.30) !important;
        }

        .mobile-input {
          background: rgba(255, 255, 255, 0.88) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 139, 139, 0.30) !important;
          color: #1a1a1a !important;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(46, 88, 113, 0.12);
        }

        .mobile-input:hover {
          border-color: rgba(0, 139, 139, 0.50) !important;
          background: rgba(255, 255, 255, 0.90) !important;
        }

        .mobile-input:focus {
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: #008B8B !important;
          box-shadow: 
            0 8px 32px rgba(46, 88, 113, 0.12),
            0 0 0 3px rgba(191, 105, 98, 0.25) !important;
          outline: none;
        }

        .mobile-chat {
          background: rgba(255, 255, 255, 0.60);
          border: 1px solid rgba(0, 139, 139, 0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(46, 88, 113, 0.05);
          position: relative;
          overflow: hidden;
        }

        .mobile-chat::before {
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

        .mobile-chat-hover:hover {
          background: rgba(255, 255, 255, 0.75) !important;
          border-color: rgba(0, 139, 139, 0.30) !important;
          transform: translateX(6px) translateY(-2px);
          box-shadow: 0 12px 32px rgba(46, 88, 113, 0.15) !important;
        }

        .mobile-chat-active {
          background: linear-gradient(
            135deg,
            rgba(0, 139, 139, 0.20) 0%,
            rgba(191, 105, 98, 0.12) 100%
          ) !important;
          border: 1px solid rgba(191, 105, 98, 0.40) !important;
          box-shadow: 
            0 12px 28px rgba(191, 105, 98, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .dark .mobile-input {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(209, 183, 66, 0.20) !important;
          color: #ffffff !important;
        }

        .dark .mobile-input:focus {
          border-color: rgba(209, 183, 66, 0.40) !important;
        }

        .dark .mobile-chat {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(209, 183, 66, 0.15);
        }
      `}</style>
      <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[#f5f7fa] dark:bg-[rgba(10,22,40,0.82)] border-r border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)] md:hidden flex flex-col ${
              tourActive ? "z-[65]" : "z-50"
            }`}
          >
            {/* Header */}
            <div
              className="p-4 border-b border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)] flex-shrink-0"
              style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-[#1a1a1a] dark:text-white font-semibold\">FOXY</h2>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon"
                    className="rounded-full h-8 w-8 bg-[#f5f7fa] dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#f0f2f7] dark:hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(0,139,139,0.10)] dark:border-[rgba(209,183,66,0.10)] transition-all"
                    title="Ayuda"
                    onClick={onHelpClick}
                  >
                    <HelpCircle className="h-4 w-4 text-[#1a1a1a] dark:text-white" />
                  </Button>
                  <SettingsMenu />
                  <span data-tour="theme-toggle">
                    <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                  </span>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 bg-[#f5f7fa] dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#f0f2f7] dark:hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(0,139,139,0.10)] dark:border-[rgba(209,183,66,0.10)] transition-all">
                    <X className="h-4 w-4 text-[#1a1a1a] dark:text-white" />
                  </Button>
                </div>
              </div>

              <Button
                data-tour="new-chat"
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full mobile-btn-primary group"
              >
                <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                Nuevo Chat
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)] flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)]" />
                <Input
                  data-tour="search"
                  placeholder="Buscar..."
                  className="pl-9 mobile-input border-mobile-input-border"
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
                      className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-all mobile-chat ${
                        activeChat === chat.id ? "mobile-chat-active" : "mobile-chat-hover"
                      }`}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[#1a1a1a] dark:text-white truncate mb-1">{chat.title}</h3>
                          <p className="text-xs text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)] truncate">{chat.preview}</p>
                          <p className="text-xs text-[#7a7a7a] dark:text-[rgba(255,255,255,0.40)] mt-1">{chat.timestamp.toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost" size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 bg-[#f5f7fa] dark:bg-[rgba(255,255,255,0.05)] hover:bg-[#f0f2f7] dark:hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(0,139,139,0.10)] dark:border-[rgba(209,183,66,0.10)]"
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

            {/* Footer vacío con safe area */}
            <div
              className="flex-shrink-0 border-t border-[rgba(0,139,139,0.30)] dark:border-[rgba(209,183,66,0.15)]"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}