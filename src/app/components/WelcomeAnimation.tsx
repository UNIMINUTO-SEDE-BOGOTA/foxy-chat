import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 1500);
    const timer3 = setTimeout(() => setStage(3), 2500);
    const timer4 = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const acronymLines = [
    { letter: "  F", rest: "acilitador" },
    { letter: " O", rest: "bservador" },
    { letter: "e", highlight: "X", rest: "perto" },
    { letter: "  Y", rest: " estratégico" },
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Figuras geométricas animadas */}
      <div className="absolute inset-0">
        {/* Círculo */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#b8cc70] opacity-30"
          initial={{ scale: 0, rotate: 0 }}
          animate={
            stage >= 1
              ? { scale: [1, 1.2, 1], rotate: 360, x: [0, 100, 0], y: [0, -50, 0] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Cuadrado */}
        <motion.div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#bf6962] opacity-40"
          initial={{ scale: 0, rotate: 0 }}
          animate={
            stage >= 1
              ? { scale: [1, 1.3, 1], rotate: -360, x: [0, -80, 0], y: [0, 60, 0] }
              : {}
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Triángulo */}
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-0 h-0 border-l-[50px] border-r-[50px] border-b-[86px] border-l-transparent border-r-transparent border-b-[#D1B742] opacity-35"
          initial={{ scale: 0, rotate: 0 }}
          animate={
            stage >= 1
              ? { scale: [1, 1.4, 1], rotate: 360, x: [0, -60, 0], y: [0, -80, 0] }
              : {}
          }
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />

        {/* Hexágono */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-20 h-20"
          initial={{ scale: 0, rotate: 0 }}
          animate={
            stage >= 1
              ? { scale: [1, 1.2, 1], rotate: -360, x: [0, 70, 0], y: [0, 70, 0] }
              : {}
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E15E29] opacity-40">
            <polygon points="50 0, 93.3 25, 93.3 75, 50 100, 6.7 75, 6.7 25" />
          </svg>
        </motion.div>
      </div>

      {/* Contenido central */}
      <div className="relative z-10 flex flex-row items-center gap-10">

        {/* Columna izquierda: ícono + FOXY */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={stage >= 1 ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            {/* Imagen 3.png — reemplazar src cuando esté disponible */}
            <div className="w-50 h-50 mx-auto mb-6 rounded-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <img
                src="3.png"
                alt="FOXY"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback al ícono si no carga la imagen
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                }}
              />
              <svg
                className="w-16 h-16 text-white hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </motion.div>

          {/* Letras FOXY con animación de entrada */}
          <div className="flex flex-row gap-1">
            {["F", "O", "X", "Y"].map((letter, i) => (
              <motion.span
                key={letter}
                className="text-6xl font-extrabold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: -40, scale: 0.5 }}
                animate={stage >= 2 ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.12,
                  ease: "backOut",
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="text-lg text-white/80 mt-2 tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={stage >= 2 ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Tu asistente inteligente
          </motion.p>

          {/* Dots loader */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={stage >= 3 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center space-x-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Separador vertical */}
        <motion.div
          className="w-px bg-white/30 self-stretch"
          initial={{ scaleY: 0 }}
          animate={stage >= 2 ? { scaleY: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Columna derecha: acrónimo animado */}
        <div className="flex flex-col gap-2">
          {acronymLines.map(({ letter, highlight, rest }, i) => (
            <motion.div
              key={i}
              className="flex items-baseline gap-1"
              initial={{ opacity: 0, x: 40 }}
              animate={stage >= 3 ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            >
              {/* Letra principal del acrónimo */}
              {highlight ? (
                <>
                  {/* "e" pequeña antes de X */}
                  <span className="text-2xl font-semibold text-white/60">{letter}</span>
                  <motion.span
                    className="text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {highlight}
                  </motion.span>
                </>
              ) : (
                <motion.span
                  className="text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {letter}
                </motion.span>
              )}
              <span className="text-xl font-medium text-white/85 tracking-wide">{rest}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}