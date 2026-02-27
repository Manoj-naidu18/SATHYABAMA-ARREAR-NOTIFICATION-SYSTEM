import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function GlassCard({ children, className, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-white/20 bg-white/10 backdrop-blur-[12px] transition-all duration-300",
        glow && "shadow-[0_0_20px_rgba(212,175,55,0.1)]",
        className
      )}
    >
      <div className="relative z-10 h-full">{children}</div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "outline";
}

export function GoldButton({ children, icon: Icon, variant = "primary", className, ...props }: GoldButtonProps) {
  const variants = {
    primary: "bg-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:scale-[1.02]",
    secondary: "bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-white/20",
    outline: "bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
  };

  return (
    <button
      className={cn(
        "group relative flex items-center justify-center gap-2 rounded-[16px] px-6 py-3 font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />}
      {children}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
    </button>
  );
}
