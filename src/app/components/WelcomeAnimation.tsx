import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback, useRef } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

// Avatares para el ciclo
const AVATARS = [
  "/3.png",
  "/4.png",
  "/7.png",
];

const AVATAR_INTERVAL_MS = 900;
const SPLASH_DURATION_MS = 3800;

// Generador de estrellas (más numerosas)
const generateStars = () => {
  const starTypes = [
    { className: "star-small", count: 400, style: {} },
    { className: "star-medium", count: 200, style: {} },
    { className: "star-large", count: 80, style: {} },
    { className: "star-orange", count: 60, style: { background: "#e15e29" } },
    { className: "star-teal", count: 60, style: { background: "#008b8b" } },
    { className: "star-gold", count: 60, style: { background: "#d1b742" } },
  ];

  return starTypes.flatMap(({ className, count, style }) =>
    Array.from({ length: count }, (_, i) => ({
      id: `${className}-${i}`,
      className,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${1 + Math.random() * 4}s`,
        ...style,
      },
    }))
  );
};

// Partículas flotantes (efecto institucional elegante)
const generateParticles = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `particle-${i}`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${3 + Math.random() * 5}s`,
    size: `${4 + Math.random() * 12}px`,
    opacity: 0.1 + Math.random() * 0.2,
  }));
};

// Órbitas configurables
const ORBITS = [
  { className: "orbit-1", size: 200, color: "#e15e29", dashed: false, reverse: false, duration: 8 },
  { className: "orbit-2", size: 300, color: "#008b8b", dashed: false, reverse: true, duration: 10 },
  { className: "orbit-3", size: 400, color: "#d1b742", dashed: false, reverse: false, duration: 12 },
  { className: "orbit-4", size: 500, color: "#ffffff", dashed: false, reverse: true, duration: 15 },
  { className: "orbit-5", size: 150, color: "#e15e29", dashed: true, reverse: false, duration: 6 },
  { className: "orbit-6", size: 250, color: "#008b8b", dashed: true, reverse: true, duration: 7 },
  { className: "orbit-7", size: 600, color: "#d1b742", dashed: true, reverse: false, duration: 18 },
];

export function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(AVATARS[0]);
  const [avatarOpacity, setAvatarOpacity] = useState(1);
  const [progress, setProgress] = useState(0);
  const stars = useRef(generateStars());
  const particles = useRef(generateParticles());
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dismissSplash = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 550);
  }, [isExiting, onComplete]);

  // Ciclo de avatares
  useEffect(() => {
    let avatarIndex = 0;
    
    cycleIntervalRef.current = setInterval(() => {
      setAvatarOpacity(0);
      setTimeout(() => {
        avatarIndex = (avatarIndex + 1) % AVATARS.length;
        setAvatarSrc(AVATARS[avatarIndex]);
        setAvatarOpacity(1);
      }, 300);
    }, AVATAR_INTERVAL_MS);

    // Barra de progreso lineal
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / SPLASH_DURATION_MS) * 100, 100);
      setProgress(newProgress);
      if (newProgress >= 100) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 30);

    // Auto-dismiss después de la duración
    timeoutRef.current = setTimeout(() => {
      dismissSplash();
    }, SPLASH_DURATION_MS);

    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [dismissSplash]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ background: "#0a1628" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 1, 1] }}
          onClick={dismissSplash}
          onTouchEnd={(e) => {
            e.preventDefault();
            dismissSplash();
          }}
        >
          {/* Fondo con estrellas */}
          <div className="absolute inset-0 pointer-events-none">
            {stars.current.map((star) => (
              <div
                key={star.id}
                className={`splash-star ${star.className}`}
                style={star.style}
              />
            ))}
          </div>

          {/* Partículas flotantes (efecto institucional) */}
          <div className="absolute inset-0 pointer-events-none">
            {particles.current.map((particle) => (
              <div
                key={particle.id}
                className="floating-particle"
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>

          {/* Órbitas giratorias */}
          <div className="absolute inset-0 pointer-events-none">
            {ORBITS.map((orbit) => (
              <div
                key={orbit.className}
                className={`splash-orbit ${orbit.className}`}
                style={{
                  width: orbit.size,
                  height: orbit.size,
                  border: `${orbit.dashed ? "2px dashed" : "2px solid"} ${orbit.color}${orbit.dashed ? "" : "40"}`,
                  animation: `${orbit.reverse ? "orbitSpinReverse" : "orbitSpin"} ${orbit.duration}s linear infinite`,
                }}
              >
                <div
                  className="orbit-dot"
                  style={{
                    background: orbit.color,
                    boxShadow: `0 0 12px ${orbit.color}`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Ondas de expansión */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="expansion-wave wave-1" />
            <div className="expansion-wave wave-2" />
            <div className="expansion-wave wave-3" />
          </div>

          {/* Contenido central */}
          <motion.div
            className="relative z-20 flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Avatar con glow institucional */}
            <div className="splash-avatar-wrap">
              <div className="avatar-ring" />
              <img
                src={avatarSrc}
                alt="FOXY"
                className="splash-avatar"
                style={{ opacity: avatarOpacity }}
              />
            </div>

            {/* Logo FOXY con gradiente refinado */}
            <div className="splash-logo">FOXY</div>

            {/* Frase institucional */}
            <div className="splash-subtitle">Ecosistema de Inteligencia Institucional</div>

            {/* Barra de progreso lineal */}
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Dots de carga */}
            <div className="loading-dots">
              <span className="dot" style={{ animationDelay: "0s" }}>●</span>
              <span className="dot" style={{ animationDelay: "0.2s" }}>●</span>
              <span className="dot" style={{ animationDelay: "0.4s" }}>●</span>
            </div>

            {/* Toca para saltar - versión elegante y sutil */}
            <motion.div
              className="splash-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="hint-icon">✦</span>
              <span className="hint-text">Toca para saltar</span>
              <span className="hint-icon">✦</span>
            </motion.div>
          </motion.div>

          <style>{`
            /* ===== ESTRELLAS ===== */
            .splash-star {
              position: absolute;
              border-radius: 50%;
              opacity: 0;
            }
            
            .star-small {
              width: 1px;
              height: 1px;
              background: white;
              animation: starTwinkle 2s ease-in-out infinite;
            }
            
            .star-medium {
              width: 2px;
              height: 2px;
              background: white;
              animation: starTwinkle 3s ease-in-out infinite;
            }
            
            .star-large {
              width: 3px;
              height: 3px;
              background: white;
              animation: starTwinkle 4s ease-in-out infinite;
            }
            
            .star-orange {
              width: 2px;
              height: 2px;
              animation: starTwinkleOrange 3s ease-in-out infinite;
            }
            
            .star-teal {
              width: 2px;
              height: 2px;
              animation: starTwinkleTeal 3.5s ease-in-out infinite;
            }
            
            .star-gold {
              width: 2px;
              height: 2px;
              animation: starTwinkleGold 2.5s ease-in-out infinite;
            }
            
            @keyframes starTwinkle {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.3); }
            }
            
            @keyframes starTwinkleOrange {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.3); box-shadow: 0 0 4px #e15e29; }
            }
            
            @keyframes starTwinkleTeal {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.3); box-shadow: 0 0 4px #008b8b; }
            }
            
            @keyframes starTwinkleGold {
              0%, 100% { opacity: 0; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.3); box-shadow: 0 0 4px #d1b742; }
            }
            
            /* ===== PARTÍCULAS FLOTANTES ===== */
            .floating-particle {
              position: absolute;
              background: radial-gradient(circle, rgba(209,183,66,0.6) 0%, rgba(225,94,41,0.3) 100%);
              border-radius: 50%;
              pointer-events: none;
              animation: floatParticle 4s ease-in-out infinite alternate;
            }
            
            @keyframes floatParticle {
              0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.1; }
              50% { opacity: 0.3; }
              100% { transform: translateY(-30px) translateX(15px) scale(1.2); opacity: 0.1; }
            }
            
            /* ===== ÓRBITAS ===== */
            .splash-orbit {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border-radius: 50%;
            }
            
            .orbit-dot {
              position: absolute;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              top: -5px;
              left: 50%;
              transform: translateX(-50%);
              animation: orbitPulse 1.5s ease-in-out infinite;
            }
            
            @keyframes orbitSpin {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            @keyframes orbitSpinReverse {
              from { transform: translate(-50%, -50%) rotate(360deg); }
              to { transform: translate(-50%, -50%) rotate(0deg); }
            }
            
            @keyframes orbitPulse {
              0%, 100% {
                opacity: 0.5;
                transform: translateX(-50%) scale(1);
              }
              50% {
                opacity: 1;
                transform: translateX(-50%) scale(1.2);
              }
            }
            
            /* ===== ONDAS DE EXPANSIÓN ===== */
            .expansion-wave {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 100px;
              height: 100px;
              margin: -50px 0 0 -50px;
              border-radius: 50%;
              border: 1px solid rgba(209, 183, 66, 0.3);
              pointer-events: none;
            }
            
            .wave-1 {
              animation: expandWave 4s ease-out infinite;
            }
            
            .wave-2 {
              animation: expandWave 4s ease-out infinite 1.3s;
            }
            
            .wave-3 {
              animation: expandWave 4s ease-out infinite 2.6s;
            }
            
            @keyframes expandWave {
              0% {
                width: 100px;
                height: 100px;
                margin: -50px 0 0 -50px;
                opacity: 0.6;
                border-width: 2px;
              }
              100% {
                width: 800px;
                height: 800px;
                margin: -400px 0 0 -400px;
                opacity: 0;
                border-width: 0.5px;
              }
            }
            
            /* ===== AVATAR ===== */
            .splash-avatar-wrap {
              position: relative;
              width: 140px;
              height: 140px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .avatar-ring {
              position: absolute;
              inset: -10px;
              border-radius: 50%;
              border: 1px solid rgba(209, 183, 66, 0.4);
              animation: ringPulse 2s ease-in-out infinite;
            }
            
            @keyframes ringPulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.4;
                border-width: 1px;
              }
              50% {
                transform: scale(1.08);
                opacity: 0.8;
                border-width: 2px;
              }
            }
            
            .splash-avatar {
              width: 140px;
              height: 140px;
              object-fit: contain;
              transition: opacity 0.3s ease;
              filter: drop-shadow(0 0 15px rgba(209, 183, 66, 0.4));
            }
            
            /* ===== TEXTO ===== */
            .splash-logo {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 76px;
              font-weight: 800;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              background: linear-gradient(135deg, #e15e29 0%, #d1b742 45%, #008b8b 100%);
              background-size: 200% 200%;
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              line-height: 1;
              animation: textShine 4s ease-in-out infinite;
            }
            
            @keyframes textShine {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
            
            .splash-subtitle {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 13px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.7);
              letter-spacing: 0.12em;
              text-transform: uppercase;
              text-align: center;
              max-width: 320px;
              line-height: 1.6;
            }
            
            /* ===== BARRA DE PROGRESO ===== */
            .progress-bar-container {
              width: 220px;
              height: 2px;
              background: rgba(255, 255, 255, 0.15);
              border-radius: 2px;
              overflow: hidden;
              margin-top: 8px;
            }
            
            .progress-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #e15e29, #d1b742, #008b8b);
              border-radius: 2px;
              transition: width 0.05s linear;
            }
            
            /* ===== DOTS DE CARGA ===== */
            .loading-dots {
              display: flex;
              gap: 10px;
              margin-top: -4px;
            }
            
            .dot {
              font-size: 10px;
              color: rgba(209, 183, 66, 0.7);
              animation: dotPulse 1.2s ease-in-out infinite;
              letter-spacing: 2px;
            }
            
            @keyframes dotPulse {
              0%, 100% {
                opacity: 0.3;
                transform: scale(0.8);
              }
              50% {
                opacity: 1;
                transform: scale(1.1);
              }
            }
            
            /* ===== HINT ELEGANTE ===== */
            .splash-hint {
              display: flex;
              align-items: center;
              gap: 12px;
              font-size: 12px;
              font-weight: 500;
              color: rgba(255, 255, 255, 0.55);
              letter-spacing: 0.08em;
              margin-top: 8px;
              padding: 6px 16px;
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(4px);
              border-radius: 30px;
              border: 0.5px solid rgba(209, 183, 66, 0.2);
              cursor: pointer;
              transition: all 0.3s ease;
            }
            
            .splash-hint:hover {
              background: rgba(255, 255, 255, 0.06);
              border-color: rgba(209, 183, 66, 0.4);
              color: rgba(255, 255, 255, 0.75);
            }
            
            .hint-icon {
              font-size: 10px;
              opacity: 0.6;
            }
            
            .hint-text {
              font-size: 11px;
              text-transform: uppercase;
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 480px) {
              .splash-logo {
                font-size: 52px;
                letter-spacing: 0.08em;
              }
              
              .splash-subtitle {
                font-size: 10px;
                max-width: 260px;
                letter-spacing: 0.1em;
              }
              
              .splash-avatar-wrap,
              .splash-avatar {
                width: 110px;
                height: 110px;
              }
              
              .progress-bar-container {
                width: 180px;
              }
              
              .splash-hint {
                gap: 8px;
                padding: 5px 12px;
              }
              
              .hint-text {
                font-size: 10px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}