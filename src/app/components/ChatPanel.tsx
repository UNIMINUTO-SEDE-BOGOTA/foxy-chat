// src/app/components/ChatPanel.tsx
import { useState, useRef, useEffect } from "react";
import { Send, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import type { Message } from "../../models/chat.model";

interface ChatPanelProps {
  chatId: string;
  messages: Message[];
  isTyping: boolean;
  onSend: (content: string) => Promise<void>;
  onMenuClick: () => void;
}

function FoxyAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-accent flex-shrink-0 ${className}`}>
      <img src="2.png" alt="FOXY" className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const fb = e.currentTarget.nextElementSibling as HTMLElement;
          if (fb) fb.style.display = "flex";
        }}
      />
      <span className="text-white font-extrabold text-xs hidden w-full h-full items-center justify-center" style={{ display: "none" }}>FX</span>
    </div>
  );
}

function FoxyWelcomeAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img src="7.png" alt="FOXY" className="w-full h-full object-contain drop-shadow-lg" />
    </div>
  );
}

export function ChatPanel({ chatId, messages, isTyping, onSend, onMenuClick }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    // ✅ Cambio 1: h-screen → 100dvh (respeta el teclado virtual y barras del SO)
    <div className="flex-1 flex flex-col bg-background overflow-hidden" style={{ height: '100dvh' }}>

      {/* Header — ✅ Cambio 2: safe-area-inset-top para notch */}
      <div
        className="p-3 border-b border-border bg-card flex-shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2">
          <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
          <FoxyAvatar className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-0.5">
              {["F","O","X","Y"].map((char, i) => (
                <motion.span key={i}
                  className="font-extrabold text-base leading-none"
                  style={{ color: "hsl(var(--primary))" }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                >{char}</motion.span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Conectado y listo para ayudar</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0">
        {/* ✅ Cambio 3: min-h-0 en el padre y el div scroll para que flex no desborde */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {messages.length === 0 && !isTyping ? (
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "backOut" }} className="mb-2">
                <FoxyWelcomeAvatar className="w-36 h-36 md:w-52 md:h-52" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-5xl font-semibold text-foreground text-center mb-1">
                ¡Hola! Soy{" "}
                <span className="font-extrabold" style={{ color: "hsl(var(--primary))" }}>FOXY</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-center max-w-sm text-xs md:text-sm px-4">
                Estoy aquí para ayudarte. Escribe tu consulta para comenzar.
              </motion.p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <motion.div key={message.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && <FoxyAvatar className="w-7 h-7 mb-1" />}
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-card-foreground"
                  }`}>
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
              <FoxyAvatar className="w-7 h-7 mb-1" />
              <div className="bg-card border border-border rounded-2xl p-3">
                <div className="flex gap-1.5">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1, repeat: Infinity, delay }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — ✅ Cambio 4: safe-area-inset-bottom para home indicator */}
      <div
        className="p-3 border-t border-border bg-card flex-shrink-0"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <textarea
            data-tour="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            rows={2}
            // ✅ Cambio 5: maxHeight para que el textarea no empuje el botón fuera de pantalla
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-10 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}