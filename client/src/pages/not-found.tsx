import { Link } from "wouter";
import StarfieldBackground from "@/components/StarfieldBackground";
import { NeonButton } from "@/components/NeonButton";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      <StarfieldBackground />

      <div className="relative z-10 text-center p-8 border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl max-w-md mx-4">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-20 h-20 text-destructive animate-pulse" />
        </div>
        
        <h1 className="text-6xl font-black font-sci-fi text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500 mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-bold font-tech text-white mb-6 tracking-widest">
          SIGNAL LOST
        </h2>
        
        <p className="text-muted-foreground mb-8">
          The coordinates you are trying to reach do not exist in this sector.
        </p>

        <Link href="/">
          <NeonButton variant="cyan" className="w-full">
            Return to Base
          </NeonButton>
        </Link>
      </div>
    </div>
  );
}
