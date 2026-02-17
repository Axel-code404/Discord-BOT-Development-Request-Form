import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import StarfieldBackground from "@/components/StarfieldBackground";
import Navigation from "@/components/Navigation";
import ChatMessage from "@/components/ChatMessage";
import { NeonButton } from "@/components/NeonButton";
import { Send, History, Code, Mail, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: messages, isLoading: isMessagesLoading } = useMessages();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <StarfieldBackground />
      <Navigation />

      <div className="flex-1 flex pt-16 h-[calc(100vh-64px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative max-w-5xl mx-auto w-full border-x border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl">
          {/* Chat Header */}
          <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h2 className="text-lg font-tech font-bold text-white tracking-wide">
                開発者 <span className="text-primary">ダイレクトライン</span>
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-1 rounded">
              セキュア接続
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide">
            {isMessagesLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
                <p className="font-mono text-xs">リンク確立中...</p>
              </div>
            ) : messages && messages.length > 0 ? (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  content={msg.content}
                  isFromAdmin={msg.isFromAdmin}
                  createdAt={msg.createdAt}
                />
              ))
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50 opacity-70">
                <Code className="w-16 h-16 mb-4 text-primary/20" />
                <h3 className="text-xl font-sci-fi text-white mb-2">システム準備完了</h3>
                <p className="max-w-md text-center text-sm">
                  ようこそ、{user?.firstName || "Traveler"}さん。開発プロセスを開始するには、以下にボットの要件を記載してください。
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-white/10 bg-black/40 backdrop-blur-md">
            <div className="relative flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ここに要件を入力してください..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[60px] max-h-[150px] resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm font-light text-white placeholder:text-white/20"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isSending}
                className="h-[60px] w-[60px] flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-mono text-center opacity-50">
              Enter で送信。Shift + Enter で改行。
            </p>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, collapsible */}
        <aside className="hidden lg:flex w-80 flex-col border-l border-white/5 bg-black/60 backdrop-blur-md">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-bold font-sci-fi text-white tracking-widest mb-1">
              コントロールパネル
            </h3>
            <p className="text-xs text-muted-foreground">クイックアクセスモジュール</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <Link href="/history">
              <SidebarItem icon={<History className="w-4 h-4" />} title="依頼履歴" description="過去の注文を表示" />
            </Link>
            <Link href="/library">
              <SidebarItem icon={<Code className="w-4 h-4" />} title="サンプルライブラリ" description="ボットテンプレートを閲覧" />
            </Link>
            <Link href="/contact">
              <SidebarItem icon={<Mail className="w-4 h-4" />} title="問い合わせフォーム" description="技術的な問題を報告" />
            </Link>
            
            <Link href="/">
              <SidebarItem icon={<ArrowLeft className="w-4 h-4" />} title="メインページ" description="トップへ戻る" />
            </Link>
            
            <div className="mt-8 p-4 rounded-xl border border-secondary/20 bg-secondary/5">
              <h4 className="text-secondary font-bold font-tech mb-2 text-sm">ヒント</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                見積もりを依頼する際は、機能を具体的に指定してください。コマンドリストや権限要件を含めると、処理がスムーズになります。
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SidebarItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group">
      <div className="mt-1 text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors font-tech">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
