import Navigation from "@/components/Navigation";
import StarfieldBackground from "@/components/StarfieldBackground";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { NeonButton } from "@/components/NeonButton";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery<any[]>({
    queryKey: ["/api/inquiries"],
  });

  const { mutate: sendInquiry, isPending } = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      const res = await fetch(api.inquiries.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      setSubject("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    sendInquiry({ subject, message });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <StarfieldBackground />
      <Navigation />
      <div className="flex-1 flex pt-16 h-[calc(100vh-64px)] container mx-auto px-4 gap-6 py-6">
        {/* Contact Form */}
        <div className="flex-1 flex justify-center items-center">
          <div className="max-w-xl w-full p-8 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl relative shadow-2xl">
            <Link href="/">
              <button className="absolute top-8 right-8 flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                メインページへ戻る
              </button>
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-8 h-8 text-primary shadow-[0_0_10px_#00f3ff]" />
              <h1 className="text-2xl font-sci-fi text-white tracking-widest">お問い合わせ</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">件名</label>
                <input 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="ボット制作の見積もりについて 等"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" 
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1 block">メッセージ</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="詳細をご記入ください..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white min-h-[150px] focus:outline-none focus:border-primary/50 transition-all resize-none" 
                />
              </div>
              <NeonButton type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                送信する
              </NeonButton>
            </form>
            <Link href="/">
              <NeonButton variant="ghost" className="w-full mt-4 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                メインページへ戻る
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Inquiry History */}
        <div className="w-96 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <h2 className="text-sm font-sci-fi text-primary tracking-widest">お問い合わせ履歴</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {isLoadingInquiries ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : inquiries?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center pt-8 font-mono">履歴はありません</p>
            ) : inquiries?.map((inq) => (
              <div key={inq.id} className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white truncate">{inq.subject}</h3>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded border",
                    inq.status === "replied" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {inq.status === "replied" ? "返信あり" : "対応中"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{inq.message}</p>
                {inq.reply && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1 text-xs text-secondary mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>管理者からの回答:</span>
                    </div>
                    <p className="text-xs text-secondary/80 italic">{inq.reply}</p>
                  </div>
                )}
                <div className="text-[8px] text-muted-foreground font-mono pt-1">
                  {format(new Date(inq.createdAt), "yyyy/MM/dd HH:mm")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
