import { useAuth } from "@/hooks/use-auth";
import StarfieldBackground from "@/components/StarfieldBackground";
import { NeonButton } from "@/components/NeonButton";
import { motion } from "framer-motion";
import { Bot, Zap, Shield, Code2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // If logged in, we shouldn't really be here, but just in case
  if (user) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <StarfieldBackground />
      
      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 flex flex-col justify-center items-center text-center relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-4">
            <span className="text-primary text-xs font-mono tracking-widest uppercase">
              次世代 Discord ボット開発
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-secondary drop-shadow-2xl">
            未来を構築する
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            コミュニティに合わせたプロフェッショナルな Discord ボット開発サービス。
            セキュアなインターフェースを通じて、開発者と直接つながります。
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/api/login">
              <NeonButton size="lg" className="w-full sm:w-auto group">
                システムを起動する <ArrowRight className="ml-2 w-4 h-4 inline-block group-hover:translate-x-1 transition-transform" />
              </NeonButton>
            </a>
            <NeonButton variant="ghost" size="lg" className="w-full sm:w-auto">
              ドキュメントを見る
            </NeonButton>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
        >
          <FeatureCard 
            icon={<Bot className="w-8 h-8 text-primary" />}
            title="AI 統合"
            description="LLM や AI エージェントを Discord サーバーにシームレスに統合します。"
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-secondary" />}
            title="高性能"
            description="スピードとスケールに合わせて最適化され、99.9% の稼働率を保証します。"
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-accent" />}
            title="セキュアなインフラ"
            description="コミュニティのデータを保護するエンタープライズグレードのセキュリティ。"
          />
        </motion.div>
      </main>

      {/* Decorative footer */}
      <footer className="w-full py-6 border-t border-white/5 bg-black/20 backdrop-blur-sm text-center">
        <p className="text-xs text-muted-foreground font-mono">
          システムステータス: <span className="text-green-500">正常稼働中</span> | V.2.4.0
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 p-3 rounded-lg bg-black/30 w-fit border border-white/10 group-hover:border-primary/50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white font-tech">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
