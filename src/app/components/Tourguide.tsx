// src/app/components/TourGuide.tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const TOUR_KEY = "foxy_tour_completed";

type Position = "top" | "bottom" | "left" | "right" | "center";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  selector: string | null;
  position: Position;
  /** Si este paso necesita que la sidebar mobile esté abierta */
  needsMobileSidebar?: boolean;
}

const steps: TourStep[] = [
  {
    id: "welcome",
    icon: "✨",
    title: "¡Bienvenida a FOXY!",
    description: "Te mostraré cómo sacarle el máximo provecho al chat. Solo toma un momento.",
    selector: null,
    position: "center",
  },
  {
    id: "new-chat",
    icon: "➕",
    title: "Nuevo Chat",
    description: "Crea una conversación nueva. Cada chat tiene su propio historial independiente.",
    selector: "[data-tour='new-chat']",
    position: "bottom",
    needsMobileSidebar: true,
  },
  {
    id: "search",
    icon: "🔍",
    title: "Buscar conversaciones",
    description: "Encuentra rápidamente cualquier conversación anterior escribiendo aquí.",
    selector: "[data-tour='search']",
    position: "bottom",
    needsMobileSidebar: true,
  },
  {
    id: "chat-item",
    icon: "🗑️",
    title: "Eliminar un chat",
    description: "Pasa el cursor sobre una conversación para ver el botón de eliminar.",
    selector: "[data-tour='chat-item']",
    position: "right",
    needsMobileSidebar: true,
  },
  {
    id: "theme",
    icon: "🌙",
    title: "Tema oscuro / claro",
    description: "Cambia entre modo oscuro y claro con este botón en cualquier momento.",
    selector: "[data-tour='theme-toggle']",
    position: "bottom",
    needsMobileSidebar: true,
  },
  {
    id: "input",
    icon: "💬",
    title: "Escribe tu mensaje",
    description: "Escribe aquí y presiona Enter para enviar. Shift + Enter hace salto de línea.",
    selector: "[data-tour='chat-input']",
    position: "top",
    needsMobileSidebar: false,
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

interface TourGuideProps {
  forceOpen?: boolean;
  onClose?: () => void;
  /** Callback para abrir/cerrar la sidebar mobile desde el tour */
  onMobileSidebarChange?: (open: boolean) => void;
}

const PAD = 10;
const MODAL_W = 300;
const MODAL_H = 200;

export function TourGuide({ forceOpen = false, onClose, onMobileSidebarChange }: TourGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

  const step = steps[currentStep];
  const isMobile = () => window.innerWidth < 768;

  const calcPositions = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < 768;

    if (!step.selector) {
      setHighlightRect(null);
      setModalPos({ top: vh / 2 - MODAL_H / 2, left: vw / 2 - MODAL_W / 2 });
      return;
    }

    const el = document.querySelector(step.selector);
    if (!el) {
      setHighlightRect(null);
      setModalPos({ top: vh / 2 - MODAL_H / 2, left: vw / 2 - MODAL_W / 2 });
      return;
    }

    const r = el.getBoundingClientRect();
    // Element not visible (off-screen or hidden)
    if (r.width === 0 && r.height === 0) {
      setHighlightRect(null);
      setModalPos({ top: vh / 2 - MODAL_H / 2, left: vw / 2 - MODAL_W / 2 });
      return;
    }

    const rect: Rect = {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    };
    setHighlightRect(rect);

    const gap = 14;
    let top = 0, left = 0;
    const pos = mobile ? "bottom" : step.position;

    switch (pos) {
      case "bottom":
        top = rect.top + rect.height + gap;
        left = rect.left + rect.width / 2 - MODAL_W / 2;
        break;
      case "top":
        top = rect.top - MODAL_H - gap;
        left = rect.left + rect.width / 2 - MODAL_W / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - MODAL_H / 2;
        left = rect.left + rect.width + gap;
        break;
      case "left":
        top = rect.top + rect.height / 2 - MODAL_H / 2;
        left = rect.left - MODAL_W - gap;
        break;
      default:
        top = vh / 2 - MODAL_H / 2;
        left = vw / 2 - MODAL_W / 2;
    }

    // En mobile forzar que no se salga de pantalla
    if (mobile) {
      left = vw / 2 - MODAL_W / 2;
      // Si el modal queda fuera abajo, ponerlo arriba del elemento
      if (top + MODAL_H > vh - 12) {
        top = rect.top - MODAL_H - gap;
      }
    }

    const margin = 12;
    left = Math.max(margin, Math.min(left, vw - MODAL_W - margin));
    top = Math.max(margin, Math.min(top, vh - MODAL_H - margin));

    setModalPos({ top, left });
  }, [step]);

  // Cuando cambia el paso: manejar sidebar mobile y recalcular
  useEffect(() => {
    if (!isOpen) return;

    const mobile = isMobile();
    const needsSidebar = step.needsMobileSidebar;

    if (mobile && needsSidebar) {
      // Abrir sidebar mobile y esperar a que termine la animación
      onMobileSidebarChange?.(true);
      const t = setTimeout(calcPositions, 350); // esperar animación spring
      return () => clearTimeout(t);
    } else if (mobile && !needsSidebar) {
      // Cerrar sidebar mobile para los pasos del panel
      onMobileSidebarChange?.(false);
      const t = setTimeout(calcPositions, 350);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(calcPositions, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, currentStep, calcPositions, step, onMobileSidebarChange]);

  useEffect(() => {
    const onResize = () => calcPositions();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcPositions]);

  // Auto-open primera vez
  useEffect(() => {
    if (forceOpen) { setIsOpen(true); setCurrentStep(0); return; }
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const t = setTimeout(() => setIsOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [forceOpen]);

  const handleClose = () => {
    localStorage.setItem(TOUR_KEY, "true");
    // Cerrar sidebar mobile al terminar
    if (isMobile()) onMobileSidebarChange?.(false);
    setIsOpen(false);
    setCurrentStep(0);
    onClose?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(s => s + 1);
    else handleClose();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* SVG Spotlight */}
          <motion.svg
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 60 }}
          >
            <defs>
              <mask id="foxy-tour-mask">
                <rect width="100%" height="100%" fill="white" />
                {highlightRect && (
                  <rect
                    x={highlightRect.left} y={highlightRect.top}
                    width={highlightRect.width} height={highlightRect.height}
                    rx="10" fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#foxy-tour-mask)" />
            {highlightRect && (
              <rect
                x={highlightRect.left} y={highlightRect.top}
                width={highlightRect.width} height={highlightRect.height}
                rx="10" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="2.5" strokeDasharray="6 3"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1s" repeatCount="indefinite" />
              </rect>
            )}
          </motion.svg>

          {/* Modal */}
          <motion.div
            key={`modal-${currentStep}`}
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            style={{ position: "fixed", top: modalPos.top, left: modalPos.left, width: MODAL_W, zIndex: 70 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Progress */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>{currentStep + 1} / {steps.length}</span>
                </div>
                <button onClick={handleClose} className="rounded-full p-1 hover:bg-muted transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 pb-2 text-center">
                <div className="text-3xl mb-2">{step.icon}</div>
                <h3 className="text-sm font-bold text-card-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <button key={i} onClick={() => setCurrentStep(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === currentStep ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {!isFirst && (
                    <Button variant="ghost" size="sm" onClick={handlePrev} className="h-7 px-2 text-xs">
                      <ChevronLeft className="w-3 h-3 mr-0.5" />Atrás
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext}
                    className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLast ? "¡Listo!" : "Siguiente"}
                    {!isLast && <ChevronRight className="w-3 h-3 ml-0.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}