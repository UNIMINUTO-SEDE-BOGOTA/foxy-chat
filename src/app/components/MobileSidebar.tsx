import { MessageSquare, Plus, Search, Trash2, Settings, HelpCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "./ThemeToggle";

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
}

export function MobileSidebar({
  isOpen,
  onClose,
  chats,
  activeChat,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isDark,
  onThemeToggle,
}: MobileSidebarProps) {
  const handleChatSelect = (id: string) => {
    onChatSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-sidebar-foreground">Agente IA</h2>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    title="Ayuda"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    title="Configuración"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Chat
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 bg-sidebar-accent border-sidebar-border"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {chats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={`group relative p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                        activeChat === chat.id
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                      }`}
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sidebar-foreground truncate mb-1">
                            {chat.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.preview}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {chat.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-sidebar-foreground truncate">Usuario</p>
                  <p className="text-xs text-muted-foreground">Plan Gratuito</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
