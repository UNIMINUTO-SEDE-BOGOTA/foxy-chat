import { useState, useRef, useEffect } from "react";
import { Send, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { motion } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  chatId: string;
  onMenuClick: () => void;
}

function FoxyAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-accent flex-shrink-0 ${className}`}>
      <img
        src="2.png"
        alt="FOXY"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
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

export function ChatPanel({ chatId, onMenuClick }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Gracias por tu mensaje. Como agente IA, puedo ayudarte con diversas tareas, análisis de datos, redacción de contenido y mucho más. ¿Qué te gustaría hacer?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestionClick = (description: string) => {
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: description, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(), role: "assistant",
        content: "Gracias por tu mensaje. Como agente IA, puedo ayudarte con diversas tareas, análisis de datos, redacción de contenido y mucho más. ¿Qué te gustaría hacer?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestions = [
    { icon: "✍️", title: "Redacción", description: "Escribe un correo profesional" },
    { icon: "🧠", title: "Conceptos", description: "Explica algo complejo de forma simple" },
    { icon: "💡", title: "Ideas", description: "Ideas innovadoras para mi proyecto" },
    { icon: "📊", title: "Datos", description: "Analiza e interpreta mis datos" },
  ];

  return (
    <div className="flex-1 h-screen flex flex-col bg-background overflow-hidden">

      {/* Header */}
      <div className="p-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
          <FoxyAvatar className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-0.5">
              {["F", "O", "X", "Y"].map((char, i) => (
                <motion.span
                  key={i}
                  className="font-extrabold text-base leading-none"
                  style={{ color: "hsl(var(--primary))" }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Conectado y listo para ayudar</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="space-y-3 max-w-4xl mx-auto">

          {messages.length === 0 && !isTyping ? (
            /* ── Bienvenida: todo en una sola vista ── */
            <div className="flex flex-col items-center justify-center pt-4 pb-2">

              {/* Imagen más pequeña */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="mb-2"
              >
                <FoxyWelcomeAvatar className="w-24 h-24 md:w-32 md:h-32" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl font-semibold text-foreground text-center mb-1"
              >
                ¡Hola! Soy{" "}
                <span className="font-extrabold" style={{ color: "hsl(var(--primary))" }}>FOXY</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-center mb-4 max-w-sm text-xs md:text-sm px-4"
              >
                Estoy aquí para ayudarte. Selecciona una opción o escribe tu consulta.
              </motion.p>

              {/* 4 tarjetas compactas en una fila */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-2xl px-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    onClick={() => handleSuggestionClick(s.description)}
                    className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl bg-card border-2 border-border hover:border-primary hover:shadow-md transition-all duration-200 text-left group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{s.icon}</span>
                    <span className="text-xs font-semibold text-card-foreground group-hover:text-primary transition-colors leading-tight">
                      {s.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                      {s.description}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Mensajes ── */
            <>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
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

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 self-end h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}