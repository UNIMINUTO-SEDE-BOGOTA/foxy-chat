import { motion } from "motion/react";
import { useEffect, useState, useCallback } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [stage, setStage] = useState(0);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

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
      className="fixed inset-0 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center z-50 overflow-hidden cursor-pointer select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={handleSkip}
      onTouchEnd={(e) => {
        e.preventDefault();
        handleSkip();
      }}
    >
      {/* Hint de skip */}
      <motion.p
        className="absolute bottom-4 right-5 text-xs text-white/50 tracking-widest uppercase pointer-events-none"
        initial={{ opacity: 0 }}
        animate={stage >= 1 ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        Toca para saltar
      </motion.p>

      {/* Figuras geométricas animadas */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Círculo */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-[#b8cc70] opacity-30"
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
          className="absolute top-1/2 right-1/4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#bf6962] opacity-40"
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
          className="absolute bottom-1/4 left-1/3 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[52px] sm:border-l-[40px] sm:border-r-[40px] sm:border-b-[69px] md:border-l-[50px] md:border-r-[50px] md:border-b-[86px] border-l-transparent border-r-transparent border-b-[#D1B742] opacity-35"
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
          className="absolute top-1/3 right-1/3 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
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
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 px-6 py-8 w-full max-w-3xl">

        {/* Columna izquierda: ícono + FOXY */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={stage >= 1 ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, ease: "backOut" }}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 mx-auto mb-4 md:mb-6 rounded-2xl backdrop-blur-sm flex items-center justify-center overflow-hidden">
              <img
                src="3.png"
                alt="FOXY"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = "flex";
                }}
              />
              <svg
                className="w-12 h-12 md:w-16 md:h-16 text-white hidden"
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

          {/* Letras FOXY */}
          <div className="flex flex-row gap-1">
            {["F", "O", "X", "Y"].map((letter, i) => (
              <motion.span
                key={letter}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg"
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
            className="text-[10px] sm:text-xs md:text-sm text-white/80 mt-2 tracking-widest uppercase text-center"
            initial={{ opacity: 0 }}
            animate={stage >= 2 ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Ecosistema de Inteligencia Institucional
          </motion.p>

          {/* Dots loader */}
          <motion.div
            className="mt-5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={stage >= 3 ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center space-x-2">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Separador vertical — solo visible en md+ */}
        <motion.div
          className="hidden md:block w-px bg-white/30 self-stretch"
          initial={{ scaleY: 0 }}
          animate={stage >= 2 ? { scaleY: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Separador horizontal — solo visible en móvil */}
        <motion.div
          className="block md:hidden h-px w-2/3 bg-white/30"
          initial={{ scaleX: 0 }}
          animate={stage >= 2 ? { scaleX: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        />

        {/* Columna derecha: acrónimo animado */}
        <div className="flex flex-col gap-2 md:gap-3">
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
              {highlight ? (
                <>
                  <span className="text-base sm:text-xl md:text-2xl font-semibold text-white/60">{letter}</span>
                  <motion.span
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {highlight}
                  </motion.span>
                </>
              ) : (
                <motion.span
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {letter}
                </motion.span>
              )}
              <span className="text-sm sm:text-base md:text-xl font-medium text-white/85 tracking-wide">{rest}</span>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}