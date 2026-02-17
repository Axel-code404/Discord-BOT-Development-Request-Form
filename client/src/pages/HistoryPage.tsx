import Navigation from "@/components/Navigation";
import StarfieldBackground from "@/components/StarfieldBackground";
import { History, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { NeonButton } from "@/components/NeonButton";

export default function HistoryPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <StarfieldBackground />
      <Navigation />
      <div className="flex-1 flex pt-16 h-[calc(100vh-64px)] justify-center items-center p-4">
        <div className="max-w-4xl w-full p-8 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl relative">
          <Link href="/">
            <button className="absolute top-8 right-8 flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              メインページへ戻る
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <History className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-sci-fi text-white">依頼履歴</h1>
          </div>
          <div className="text-muted-foreground font-mono text-sm mb-6">
            依頼履歴はまだありません。
          </div>
          <Link href="/">
            <NeonButton variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              メインページへ戻る
            </NeonButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
