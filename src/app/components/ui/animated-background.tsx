import { motion } from "motion/react";
import { useMemo } from "react";

type BackgroundType = "hero" | "dashboard" | "analytics" | "upload" | "profile" | "alert";

interface AnimatedBackgroundProps {
  type: BackgroundType;
}

export function AnimatedBackground({ type }: AnimatedBackgroundProps) {
  const particles = useMemo(() => Array.from({ length: 20 }), []);

  const getThemeStyles = () => {
    switch (type) {
      case "hero":
        return "bg-[#F8F6F0]"; // Champagne White
      case "dashboard":
        return "bg-[#F2F2F2]"; // Light Grey
      case "analytics":
        return "bg-gradient-to-br from-[#0F766E]/5 to-[#F2F2F2]"; // Teal mix
      case "upload":
        return "bg-gradient-to-br from-[#4682B4]/5 to-[#F2F2F2]"; // Steel Blue mix
      case "profile":
        return "bg-[#F5F5DC]"; // Beige
      case "alert":
        return "bg-gradient-to-br from-[#FFBF00]/10 to-[#F2F2F2]"; // Amber mix
      default:
        return "bg-white";
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-1000 ${getThemeStyles()}`}>
      {/* Abstract Ribbons / Waves */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[120%] h-[120%] blur-[100px]"
          style={{
            background: type === "hero" 
              ? "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)"
          }}
        />
      </div>

      {/* Grid Pattern (Dashboard/Analytics) */}
      {(type === "dashboard" || type === "analytics") && (
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "radial-gradient(#D4AF37 1px, transparent 1px)", 
            backgroundSize: "40px 40px" 
          }} 
        />
      )}

      {/* Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5
          }}
          animate={{
            y: ["-10%", "110%"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-[#D4AF37]/40 rounded-full"
        />
      ))}

      {/* Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 pointer-events-none" />
    </div>
  );
}
