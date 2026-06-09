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
    <div className={`cp-avatar rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
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
const STATUS_PHRASES = ["Consultando...", "Espera un Poco...", "Analizando..."];

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
      className="cp-typing-status"
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
          className="block w-2 h-2 rounded-full cp-wave-dot"
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Chart image con lightbox ──────────────────────────────
function ChartImage({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="mt-2.5 rounded-xl overflow-hidden cp-chart-wrap cursor-zoom-in"
        onClick={() => status === "ok" && setOpen(true)}
      >
        {status === "loading" && (
          <div className="flex items-center justify-center h-32 text-xs gap-2 cp-chart-loading">
            <motion.div
              className="w-3 h-3 rounded-full cp-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            Cargando gráfica...
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center h-20 text-xs cp-chart-loading">
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
          <div className="text-center py-1 text-xs cp-chart-hint">
            Clic para ampliar
          </div>
        )}
      </div>

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
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                Cerrar ✕
              </button>
              <img
                src={url}
                alt="Gráfica ampliada"
                className="w-full h-auto rounded-xl"
                style={{ background: "white", maxHeight: "85vh", objectFit: "contain" }}
              />
              <a
                href={url}
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
      className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <FoxyAvatar className="w-7 h-7 mb-1 flex-shrink-0" />}

      <div
        className={`max-w-[85%] md:max-w-[70%] px-4 py-3 text-sm leading-relaxed ${
          isUser ? "cp-bubble-user" : "cp-bubble-bot"
        }`}
        style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        }}
      >
        {shown && <p className="whitespace-pre-wrap">{shown}</p>}
        {message.chartUrl && <ChartImage url={message.chartUrl} />}
        <p className={`text-xs mt-1.5 ${isUser ? "cp-time-user" : "cp-time-bot"}`}>
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
      className="cp-textarea flex-1 resize-none"
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
    <div className="cp-root relative flex-1 flex flex-col overflow-hidden" style={{ height: "100dvh" }}>

      {/* ── Subtle ambient background orbs ── */}
      <div className="cp-orb cp-orb-1" />
      <div className="cp-orb cp-orb-2" />
      <div className="cp-orb cp-orb-3" />

      {/* ── Header glassmorphism ── */}
      <div className="cp-header px-4 py-3 flex-shrink-0" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-3">
          <Button onClick={onMenuClick} variant="ghost" size="icon" className="md:hidden cp-icon-btn rounded-full h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
          <FoxyAvatar className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-[1px]">
              {["F", "O", "X", "Y"].map((char, i) => (
                <motion.span key={i}
                  className="cp-header-title-char font-extrabold text-base leading-none"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                >{char}</motion.span>
              ))}
            </div>
            <p className="cp-header-subtitle text-xs mt-0.5">Conectado y listo para ayudar</p>
          </div>

          {/* Online status pill */}
          <div className="cp-status-pill">
            <span className="cp-status-dot" />
            <span>En línea</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="cp-messages flex-1 overflow-y-auto p-3 md:p-4 min-h-0"
      >
        <div className="space-y-3 max-w-4xl mx-auto">

          {messages.length === 0 && !isTyping ? (
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
                className="mb-2"
              >
                <FoxyWelcomeAvatar className="w-36 h-36 md:w-52 md:h-52" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="cp-welcome-title text-3xl md:text-5xl font-semibold text-center mb-1"
              >
                ¡Hola! Soy{" "}
                <span className="cp-welcome-accent font-extrabold">FOXY</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="cp-welcome-sub text-center max-w-sm text-xs md:text-sm px-4"
              >
                Estoy aquí para ayudarte. Escribe tu consulta para comenzar.
              </motion.p>

              {/* Suggestion chips */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap justify-center gap-2 mt-6 px-4"
              >
                {[
                  "¿Cuántos estudiantes hay matriculados en 2026?",
                  "¿Cuál es la tasa de deserción este semestre?",
                  "¿Cuántos programas académicos hay activos?",
                ].map((chip) => (
                  <button
                    key={chip}
                    className="cp-suggestion-chip"
                    onClick={() => onSend(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
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

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2.5"
            >
              <FoxyAvatar className="w-7 h-7 mb-1" />
              <div className="cp-typing-bubble px-4 py-3" style={{ borderRadius: "18px 18px 18px 4px" }}>
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
            className="cp-scroll-fab absolute bottom-24 right-4 z-30 rounded-full w-9 h-9 flex items-center justify-center"
            aria-label="Ir al último mensaje"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div
        className="cp-input-bar px-3 py-2.5 flex-shrink-0"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
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
              className="cp-send-btn rounded-2xl w-10 h-10 p-0 flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ─── CSS ─────────────────────────────────────────────────── */}
      <style>{`
        /* ─── LIGHT MODE — fondo blanco real con acentos teal ──── */
        :root, .light {
          --cp-bg:            #f0f6fa;
          --cp-radial-1:      rgba(0,139,139,0.10);
          --cp-radial-2:      rgba(46,88,113,0.07);
          --cp-radial-3:      rgba(209,183,66,0.08);

          --cp-header-bg:     rgba(240,246,252,0.85);
          --cp-header-border: rgba(0,139,139,0.12);
          --cp-header-shine:  linear-gradient(90deg, transparent, rgba(0,139,139,0.08), rgba(209,183,66,0.06), transparent);

          --cp-text-primary:   #0f2233;
          --cp-text-secondary: rgba(15,34,51,0.68);
          --cp-text-muted:     rgba(15,34,51,0.38);
          --cp-accent:         #008B8B;
          --cp-accent-gold:    #b89a20;

          /* bubbles */
          --cp-bubble-user-bg:     linear-gradient(135deg, #2E5871 0%, #1a6b6b 50%, #008B8B 100%);
          --cp-bubble-user-border: rgba(0,139,139,0.30);
          --cp-bubble-user-shadow: 0 4px 20px rgba(0,139,139,0.22), inset 0 1px 0 rgba(255,255,255,0.22);
          --cp-bubble-user-text:   #e4f0f8;
          --cp-bubble-user-time:   rgba(228,240,248,0.58);

          --cp-bubble-bot-bg:      rgba(255,255,255,0.80);
          --cp-bubble-bot-border:  rgba(0,139,139,0.14);
          --cp-bubble-bot-shadow:  0 2px 12px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.90);
          --cp-bubble-bot-text:    #0f2233;
          --cp-bubble-bot-time:    rgba(15,34,51,0.38);

          /* typing */
          --cp-typing-bg:     rgba(255,255,255,0.80);
          --cp-typing-border: rgba(0,139,139,0.14);

          /* input bar */
          --cp-bar-bg:        rgba(240,246,252,0.88);
          --cp-bar-border:    rgba(0,139,139,0.12);

          --cp-textarea-bg:   rgba(255,255,255,0.90);
          --cp-textarea-border: rgba(0,139,139,0.20);
          --cp-textarea-focus: rgba(0,139,139,0.50);
          --cp-textarea-glow: rgba(0,139,139,0.10);
          --cp-textarea-color: #0f2233;

          --cp-send-bg:       linear-gradient(130deg, #2E5871 0%, #bf6962 55%, #D1B742 100%);
          --cp-send-shadow:   0 4px 16px rgba(191,105,98,0.26), inset 0 1px 0 rgba(255,255,255,0.22);

          /* scroll fab */
          --cp-fab-bg:        rgba(255,255,255,0.90);
          --cp-fab-border:    rgba(0,139,139,0.18);
          --cp-fab-color:     #0f2233;

          /* suggestion chips */
          --cp-chip-bg:       rgba(255,255,255,0.70);
          --cp-chip-border:   rgba(0,139,139,0.18);
          --cp-chip-color:    rgba(15,34,51,0.72);
          --cp-chip-hover-bg: rgba(0,139,139,0.10);
          --cp-chip-hover-border: rgba(0,139,139,0.32);
          --cp-chip-hover-color: #005f5f;

          /* chart */
          --cp-chart-bg:      rgba(255,255,255,0.70);
          --cp-chart-border:  rgba(0,139,139,0.12);

          /* status pill */
          --cp-pill-bg:       rgba(0,139,139,0.10);
          --cp-pill-border:   rgba(0,139,139,0.22);
          --cp-pill-text:     #006060;
          --cp-dot-color:     #008B8B;

          /* avatar ring */
          --cp-avatar-ring:   rgba(0,139,139,0.25);
          --cp-avatar-bg:     linear-gradient(135deg, #2E5871, #008B8B);

          /* welcome screen */
          --cp-welcome-title-color: #0f2233;
          --cp-welcome-sub-color:   rgba(15,34,51,0.50);

          /* icon btn */
          --cp-icon-btn-bg:     rgba(0,0,0,0.05);
          --cp-icon-btn-border: rgba(0,139,139,0.16);
          --cp-icon-btn-color:  rgba(15,34,51,0.60);
          --cp-icon-btn-hover-bg: rgba(0,139,139,0.10);
          --cp-icon-btn-hover-border: rgba(0,139,139,0.28);

          /* orbs */
          --cp-orb-opacity: 0.12;

          /* messages area scrollbar */
          --cp-scrollbar:     rgba(0,139,139,0.22);
        }

        /* ─── DARK MODE ──────────────────────────────────────────── */
        .dark {
          --cp-bg:            #06101c;
          --cp-radial-1:      rgba(0,139,139,0.05);
          --cp-radial-2:      rgba(46,88,113,0.07);
          --cp-radial-3:      rgba(209,183,66,0.04);

          --cp-header-bg:     rgba(6,16,28,0.82);
          --cp-header-border: rgba(255,255,255,0.06);

          --cp-text-primary:   #e4f0f8;
          --cp-text-secondary: rgba(196,222,240,0.72);
          --cp-text-muted:     rgba(160,200,220,0.42);

          --cp-bubble-bot-bg:      rgba(255,255,255,0.04);
          --cp-bubble-bot-border:  rgba(255,255,255,0.07);
          --cp-bubble-bot-shadow:  0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05);
          --cp-bubble-bot-text:    #e4f0f8;
          --cp-bubble-bot-time:    rgba(160,200,220,0.42);

          --cp-typing-bg:     rgba(255,255,255,0.04);
          --cp-typing-border: rgba(255,255,255,0.07);

          --cp-bar-bg:        rgba(6,16,28,0.85);
          --cp-bar-border:    rgba(255,255,255,0.07);

          --cp-textarea-bg:   rgba(255,255,255,0.05);
          --cp-textarea-border: rgba(255,255,255,0.09);
          --cp-textarea-focus: rgba(0,139,139,0.44);
          --cp-textarea-glow: rgba(0,139,139,0.12);
          --cp-textarea-color: #e4f0f8;

          --cp-fab-bg:        rgba(6,16,28,0.90);
          --cp-fab-border:    rgba(255,255,255,0.08);
          --cp-fab-color:     rgba(196,222,240,0.72);

          --cp-chip-bg:       rgba(255,255,255,0.05);
          --cp-chip-border:   rgba(255,255,255,0.08);
          --cp-chip-color:    rgba(196,222,240,0.72);
          --cp-chip-hover-bg: rgba(0,139,139,0.16);
          --cp-chip-hover-border: rgba(0,139,139,0.28);
          --cp-chip-hover-color: #7dd9d9;

          --cp-chart-bg:      rgba(255,255,255,0.03);
          --cp-chart-border:  rgba(255,255,255,0.06);

          --cp-pill-bg:       rgba(0,139,139,0.14);
          --cp-pill-border:   rgba(0,139,139,0.24);
          --cp-pill-text:     rgba(0,200,200,0.90);
          --cp-dot-color:     #00c8c8;

          --cp-avatar-ring:   rgba(0,139,139,0.30);

          --cp-welcome-title-color: #e4f0f8;
          --cp-welcome-sub-color:   rgba(160,200,220,0.50);

          --cp-icon-btn-bg:     rgba(255,255,255,0.05);
          --cp-icon-btn-border: rgba(255,255,255,0.09);
          --cp-icon-btn-color:  rgba(196,222,240,0.72);
          --cp-icon-btn-hover-bg: rgba(0,139,139,0.16);
          --cp-icon-btn-hover-border: rgba(0,139,139,0.28);

          --cp-orb-opacity: 0.10;

          --cp-bubble-bot-bg:      rgba(255,255,255,0.04);
          --cp-bubble-bot-border:  rgba(255,255,255,0.07);
          --cp-bubble-bot-shadow:  0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05);

          --cp-typing-bg:     rgba(255,255,255,0.04);
          --cp-typing-border: rgba(255,255,255,0.07);

          --cp-bar-bg:        rgba(6,16,28,0.85);
          --cp-textarea-bg:   rgba(255,255,255,0.04);
          --cp-textarea-border: rgba(255,255,255,0.08);

          --cp-fab-bg:        rgba(6,16,28,0.90);
          --cp-fab-border:    rgba(255,255,255,0.08);

          --cp-chip-bg:       rgba(255,255,255,0.04);
          --cp-chip-border:   rgba(255,255,255,0.07);

          --cp-chart-bg:      rgba(255,255,255,0.03);
          --cp-chart-border:  rgba(255,255,255,0.06);

          --cp-scrollbar:     rgba(209,183,66,0.14);
        }

        /* ─── Root / background ─────────────────────────────────── */
        .cp-root {
          background:
            radial-gradient(ellipse at 75% 5%,  var(--cp-radial-1) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 85%, var(--cp-radial-2) 0%, transparent 45%),
            radial-gradient(ellipse at 88% 92%, var(--cp-radial-3) 0%, transparent 40%),
            var(--cp-bg);
        }

        /* ambient orbs */
        .cp-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(60px);
          opacity: var(--cp-orb-opacity, 0.10);
        }
        .cp-orb-1 {
          width: 340px; height: 340px;
          top: -80px; right: -60px;
          background: #008B8B;
        }
        .cp-orb-2 {
          width: 280px; height: 280px;
          bottom: 60px; left: -80px;
          background: #2E5871;
        }
        .cp-orb-3 {
          width: 200px; height: 200px;
          top: 40%; right: 5%;
          background: #D1B742;
        }
        .cp-root > *:not(.cp-orb) { position: relative; z-index: 1; }

        /* ─── Header ─────────────────────────────────────────────── */
        .cp-header {
          background: var(--cp-header-bg);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border-bottom: 1px solid var(--cp-header-border);
          position: relative;
          overflow: hidden;
        }
        .cp-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 1px;
          background: var(--cp-header-shine, linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent));
          pointer-events: none;
        }

        .cp-header-title-char { color: #008B8B; }
        .cp-header-subtitle { color: var(--cp-text-muted); }

        /* status pill */
        .cp-status-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--cp-pill-bg);
          border: 1px solid var(--cp-pill-border);
          font-size: 11px;
          color: var(--cp-pill-text);
          font-weight: 500;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }
        .cp-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--cp-dot-color);
          box-shadow: 0 0 6px var(--cp-dot-color);
          animation: cp-pulse 2s ease-in-out infinite;
        }
        @keyframes cp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(0.85); }
        }

        /* icon buttons in header */
        .cp-icon-btn {
          background: var(--cp-icon-btn-bg) !important;
          border: 1px solid var(--cp-icon-btn-border) !important;
          color: var(--cp-icon-btn-color) !important;
          transition: all 0.22s ease;
        }
        .cp-icon-btn:hover {
          background: var(--cp-icon-btn-hover-bg) !important;
          border-color: var(--cp-icon-btn-hover-border) !important;
        }

        /* avatar ring */
        .cp-avatar {
          background: var(--cp-avatar-bg);
          box-shadow: 0 0 0 2px var(--cp-avatar-ring), 0 2px 8px rgba(0,0,0,0.20);
        }

        /* ─── Messages scrollable area ───────────────────────────── */
        .cp-messages::-webkit-scrollbar       { width: 4px; }
        .cp-messages::-webkit-scrollbar-track { background: transparent; }
        .cp-messages::-webkit-scrollbar-thumb {
          background: var(--cp-scrollbar);
          border-radius: 2px;
        }

        /* ─── Welcome screen ─────────────────────────────────────── */
        .cp-welcome-title  { color: var(--cp-welcome-title-color); }
        .cp-welcome-accent { color: #008B8B; }
        .cp-welcome-sub    { color: var(--cp-welcome-sub-color); }

        /* suggestion chips */
        .cp-suggestion-chip {
          padding: 7px 16px;
          border-radius: 20px;
          background: var(--cp-chip-bg);
          border: 1px solid var(--cp-chip-border);
          color: var(--cp-chip-color);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.02em;
        }
        .cp-suggestion-chip:hover {
          background: var(--cp-chip-hover-bg);
          border-color: var(--cp-chip-hover-border);
          color: var(--cp-chip-hover-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(0,139,139,0.18);
        }

        /* ─── Message bubbles ────────────────────────────────────── */
        .cp-bubble-user {
          background: var(--cp-bubble-user-bg);
          border: 1px solid var(--cp-bubble-user-border);
          box-shadow: var(--cp-bubble-user-shadow);
          color: var(--cp-bubble-user-text);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
        }
        /* shimmer on user bubble */
        .cp-bubble-user::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.30), transparent);
          pointer-events: none;
        }

        .cp-bubble-bot {
          background: var(--cp-bubble-bot-bg);
          border: 1px solid var(--cp-bubble-bot-border);
          box-shadow: var(--cp-bubble-bot-shadow);
          color: var(--cp-bubble-bot-text);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
        }

        .cp-time-user { color: var(--cp-bubble-user-time); }
        .cp-time-bot  { color: var(--cp-bubble-bot-time); }

        /* ─── Typing bubble ──────────────────────────────────────── */
        .cp-typing-bubble {
          background: var(--cp-typing-bg);
          border: 1px solid var(--cp-typing-border);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .cp-typing-status {
          font-size: 11px;
          color: var(--cp-text-muted);
          display: block;
          margin-bottom: 6px;
          letter-spacing: 0.03em;
        }
        .cp-wave-dot { background: #008B8B; }

        /* ─── Input bar ──────────────────────────────────────────── */
        .cp-input-bar {
          background: var(--cp-bar-bg);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border-top: 1px solid var(--cp-bar-border);
          position: relative;
        }
        .cp-input-bar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,139,139,0.18), rgba(209,183,66,0.12), transparent);
          pointer-events: none;
        }

        .cp-textarea {
          border-radius: 16px;
          border: 1px solid var(--cp-textarea-border);
          background: var(--cp-textarea-bg);
          color: var(--cp-textarea-color);
          padding: 10px 16px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          outline: none;
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
          width: 100%;
        }
        .cp-textarea::placeholder { color: var(--cp-text-muted); }
        .cp-textarea:focus {
          border-color: var(--cp-textarea-focus);
          box-shadow: 0 0 0 3px var(--cp-textarea-glow);
        }
        .cp-textarea:disabled { opacity: 0.50; }

        .cp-send-btn {
          background: var(--cp-send-bg) !important;
          border: 1px solid rgba(255,255,255,0.18) !important;
          color: white !important;
          box-shadow: var(--cp-send-shadow);
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .cp-send-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
          transition: left 0.45s ease;
        }
        .cp-send-btn:hover::before { left: 100%; }
        .cp-send-btn:disabled {
          opacity: 0.42 !important;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ─── Scroll FAB ─────────────────────────────────────────── */
        .cp-scroll-fab {
          background: var(--cp-fab-bg);
          border: 1px solid var(--cp-fab-border);
          color: var(--cp-fab-color);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.14);
          transition: all 0.22s ease;
        }
        .cp-scroll-fab:hover {
          background: rgba(0,139,139,0.12);
          border-color: rgba(0,139,139,0.28);
          transform: translateY(-2px);
        }

        /* ─── Chart ──────────────────────────────────────────────── */
        .cp-chart-wrap {
          background: var(--cp-chart-bg);
          border: 1px solid var(--cp-chart-border);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .cp-chart-loading { color: var(--cp-text-muted); }
        .cp-chart-hint { color: var(--cp-text-muted); background: rgba(0,0,0,0.10); }
        .cp-spinner {
          border: 2px solid var(--cp-textarea-focus);
          border-top-color: transparent;
        }
      `}</style>
    </div>
  );
}