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
            className="fixed bottom-0 left-0 w-[280px] z-[80] bg-sidebar border-t border-sidebar-border rounded-t-2xl overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle drag visual */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-4 py-2 border-b border-sidebar-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Configuración</p>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2">
              <button
                onClick={() => { setOpen(false); window.location.reload(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent active:scale-[0.98] transition-all text-left"
              >
                <RefreshCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
            className={`fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border md:hidden flex flex-col ${
              tourActive ? "z-[65]" : "z-50"
            }`}
          >
            {/* Header */}
            <div
              className="p-4 border-b border-sidebar-border flex-shrink-0"
              style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-sidebar-foreground">FOXY</h2>
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
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                data-tour="new-chat"
                onClick={() => { onNewChat(); onClose(); }}
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
                  placeholder="Buscar..."
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
                      onClick={() => handleChatSelect(chat.id)}
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

            {/* Footer vacío con safe area */}
            <div
              className="flex-shrink-0 border-t border-sidebar-border"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}