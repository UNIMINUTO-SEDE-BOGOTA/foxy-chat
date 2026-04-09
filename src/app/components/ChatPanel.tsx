// src/app/components/ChatPanel.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import type { Message } from "../../models/chat.model";

interface ChatPanelProps {
  chatId: string;
  messages: Message[];
  isTyping: boolean;
  onSend: (content: string) => Promise<void>;
  onMenuClick: () => void;
}

// ─── Avatar ───────────────────────────────────────────────
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

// ─── Status carousel ──────────────────────────────────────
const STATUS_PHRASES = ["Consultando...", "Espera un Poco...","Analizando..."];

function StatusCarousel() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % STATUS_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 1800);
    return () => clearInterval(tick);
  }, []);

  return (
    <motion.span
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="text-xs text-muted-foreground block mb-1.5"
    >
      {STATUS_PHRASES[index]}
    </motion.span>
  );
}

// ─── Typing indicator (wave) ──────────────────────────────
function TypingWave() {
  return (
    <div className="flex gap-1 items-center h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{ backgroundColor: "hsl(var(--primary))" }}
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Chart image con estado de carga ──────────────────────
// ─── Chart image con lightbox ──────────────────────────────
function ChartImage({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Thumbnail en el bubble */}
      <div
        className="mt-2.5 rounded-xl overflow-hidden border border-border bg-muted/30 cursor-zoom-in"
        onClick={() => status === "ok" && setOpen(true)}
      >
        {status === "loading" && (
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground gap-2">
            <motion.div
              className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            Cargando gráfica...
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            ⚠️ No se pudo cargar la gráfica
          </div>
        )}
        <img
          src={url}
          alt="Gráfica generada"
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
          className="w-full h-auto block transition-opacity hover:opacity-90"
          style={{
            maxHeight: "360px",
            objectFit: "contain",
            background: "white",
            display: status === "ok" ? "block" : "none",
          }}
        />
        {status === "ok" && (
          <div className="text-center py-1 text-xs text-muted-foreground bg-muted/20">
            Clic para ampliar
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                Cerrar ✕
              </button>

              {/* Imagen ampliada */}
              <img
                src={url}
                alt="Gráfica ampliada"
                className="w-full h-auto rounded-xl"
                style={{ background: "white", maxHeight: "85vh", objectFit: "contain" }}
              />

              {/* Botón descargar */}
              
                <a href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute -bottom-9 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Abrir en nueva pestaña ↗
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Individual message bubble ─────────────────────────────
function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === "user";

  const [shown, setShown] = useState(isUser || !isLast ? message.content : "");
  const animated = useRef(false);

  useEffect(() => {
    if (isUser || !isLast) { setShown(message.content); return; }
    if (animated.current) { setShown(message.content); return; }
    animated.current = true;
    setShown("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(message.content.slice(0, i));
      if (i >= message.content.length) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <FoxyAvatar className="w-7 h-7 mb-1 flex-shrink-0" />}

      <div
        className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-card-foreground"
        }`}
        style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          boxShadow: isUser
            ? "0 2px 8px rgba(0,139,139,0.18)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Texto del mensaje */}
        {shown && <p className="whitespace-pre-wrap">{shown}</p>}

        {/* ── Gráfica ── */}
        {message.chartUrl && <ChartImage url={message.chartUrl} />}

        <p className={`text-xs mt-1.5 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Auto-grow textarea ────────────────────────────────────
function AutoTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  placeholder: string;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      data-tour="chat-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      rows={1}
      disabled={disabled}
      className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow disabled:opacity-50"
      style={{
        maxHeight: "120px",
        overflowY: "auto",
        overflowX: "hidden",
        fontSize: "16px",
        lineHeight: "1.5",
        transition: "height 0.15s ease",
      }}
    />
  );
}

// ─── Main component ────────────────────────────────────────
export function ChatPanel({ chatId, messages, isTyping, onSend, onMenuClick }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 200) scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

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
    <div className="relative flex-1 flex flex-col bg-background overflow-hidden" style={{ height: "100dvh" }}>

      {/* ── Header glassmorphism ── */}
      <div
        className="px-3 py-2.5 border-b border-border flex-shrink-0"
        style={{
          paddingTop: "max(0.625rem, env(safe-area-inset-top))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "color-mix(in srgb, var(--card) 80%, transparent)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center gap-2">
          <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
          <FoxyAvatar className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-0.5">
              {["F", "O", "X", "Y"].map((char, i) => (
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

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0"
      >
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
              {messages.map((message, idx) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={idx === messages.length - 1}
                />
              ))}
            </>
          )}

          {/* Typing wave indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <FoxyAvatar className="w-7 h-7 mb-1" />
              <div
                className="bg-card border border-border px-4 py-3"
                style={{ borderRadius: "18px 18px 18px 4px" }}
              >
                <StatusCarousel />
                <TypingWave />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Scroll-to-bottom FAB ── */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            key="scroll-btn"
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-4 z-30 rounded-full w-9 h-9 flex items-center justify-center shadow-lg border border-border"
            style={{ backgroundColor: "color-mix(in srgb, var(--card) 90%, transparent)", backdropFilter: "blur(8px)" }}
            aria-label="Ir al último mensaje"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div
        className="px-3 py-2.5 border-t border-border flex-shrink-0"
        style={{
          paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: "color-mix(in srgb, var(--card) 85%, transparent)",
        }}
      >
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <AutoTextarea
            value={input}
            onChange={setInput}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje..."
            disabled={isTyping}
          />
          <motion.div whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }}>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground w-10 h-10 p-0 flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ boxShadow: "0 2px 12px rgba(0,139,139,0.30)" }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}