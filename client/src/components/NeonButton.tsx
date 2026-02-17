import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cyan" | "magenta" | "ghost";
  size?: "sm" | "md" | "lg";
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "cyan", size = "md", children, ...props }, ref) => {
    const baseStyles = "relative overflow-hidden font-tech font-bold uppercase tracking-widest transition-all duration-300 ease-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
    
    const variants = {
      cyan: "bg-primary/10 text-primary border border-primary/50 hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:text-white",
      magenta: "bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary/20 hover:border-secondary hover:shadow-[0_0_20px_rgba(188,19,254,0.4)] hover:text-white",
      ghost: "bg-transparent text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {/* Shine effect on hover handled by CSS logic above, but could add elements here if needed */}
      </button>
    );
  }
);

NeonButton.displayName = "NeonButton";

export { NeonButton };
