import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAdminUsers, useAdminUserMessages, useAdminReply } from "@/hooks/use-messages";
import StarfieldBackground from "@/components/StarfieldBackground";
import Navigation from "@/components/Navigation";
import ChatMessage from "@/components/ChatMessage";
import { Loader2, User, Search, Send, Clock, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";

export default function AdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const { data: users, isLoading: isUsersLoading } = useAdminUsers();
  
  const [activeTab, setActiveTab] = useState<"chat" | "inquiry">("chat");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [inquiryReply, setInquiryReply] = useState("");
  
  const { data: messages, isLoading: isMessagesLoading } = useAdminUserMessages(selectedUserId);
  const { mutate: sendReply, isPending: isSendingReply } = useAdminReply();
  
  const { data: inquiries, isLoading: isInquiriesLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const { mutate: replyToInquiry, isPending: isReplyingInquiry } = useMutation({
    mutationFn: async ({ id, reply }: { id: number; reply: string }) => {
      const res = await fetch(buildUrl(api.admin.replyInquiry.path, { id }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      if (!res.ok) throw new Error("Failed to reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      setInquiryReply("");
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00f3ff]" />
      </div>
    );
  }

  // Check if user is logged in (Authentication)
  if (!user) {
    window.location.href = "/";
    return null;
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <StarfieldBackground />
        <div className="w-full max-w-md bg-black/40 border border-[#00f3ff]/20 p-8 rounded-lg backdrop-blur-md relative z-10 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
          <div className="flex flex-col gap-6">
            <header className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tighter text-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.3)] font-sci-fi">
                RESTRICTED ACCESS
              </h1>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Administrator Verification Required</p>
            </header>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPassword === "Imadakeisuke-admin-page") {
                  setIsAdminAuthenticated(true);
                } else {
                  alert("認証に失敗しました。パスワードが正しくありません。");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest ml-1">Access Key</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-black/60 border border-[#00f3ff]/20 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#00f3ff]/50 transition-all font-mono tracking-widest"
                  placeholder="••••••••••••••••"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#00f3ff] hover:bg-[#00d8e6] text-black font-bold py-3 rounded-md transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)] font-mono uppercase tracking-widest text-sm"
              >
                Execute Auth
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <StarfieldBackground />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tighter text-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              ADMIN CONTROL CENTER
            </h1>
            <p className="text-zinc-400 font-mono text-sm">システム管理・メッセージモニタリング</p>
          </header>

          <div className="flex border-b border-[#00f3ff]/20 gap-4 mb-2">
            <button 
              onClick={() => setActiveTab("chat")}
              className={cn(
                "px-6 py-2 font-mono text-sm tracking-widest transition-all",
                activeTab === "chat" 
                  ? "text-[#00f3ff] border-b-2 border-[#00f3ff] bg-[#00f3ff]/5" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              CHAT_MONITOR
            </button>
            <button 
              onClick={() => setActiveTab("inquiry")}
              className={cn(
                "px-6 py-2 font-mono text-sm tracking-widest transition-all",
                activeTab === "inquiry" 
                  ? "text-[#00f3ff] border-b-2 border-[#00f3ff] bg-[#00f3ff]/5" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              INQUIRY_MANAGEMENT
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {activeTab === "chat" ? (
              <>
                {/* Sidebar / User List */}
                <div className="lg:col-span-1 bg-black/40 border border-[#00f3ff]/20 rounded-lg overflow-hidden backdrop-blur-sm">
                  <div className="p-4 border-b border-[#00f3ff]/10 bg-[#00f3ff]/5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="ユーザーを検索..."
                        className="w-full bg-black/40 border border-[#00f3ff]/20 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00f3ff]/50"
                      />
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[600px]">
                    {isUsersLoading ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00f3ff]/50" />
                      </div>
                    ) : users?.map((u: any) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 transition-colors border-b border-[#00f3ff]/5",
                          selectedUserId === u.id ? "bg-[#00f3ff]/10" : "hover:bg-white/5"
                        )}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#00f3ff]/20 flex items-center justify-center border border-[#00f3ff]/30">
                          {u.profileImageUrl ? (
                            <img src={u.profileImageUrl} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-[#00f3ff]" />
                          )}
                        </div>
                        <div className="flex-1 text-left truncate">
                          <div className="font-medium text-sm text-white">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-3 bg-black/40 border border-[#00f3ff]/20 rounded-lg flex flex-col backdrop-blur-sm min-h-[600px]">
                  {selectedUserId ? (
                    <>
                      <div className="p-4 border-b border-[#00f3ff]/10 bg-[#00f3ff]/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-[#00f3ff]">USER_ID: {selectedUserId.slice(0, 8)}...</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white/10 rounded-md transition-colors text-zinc-400">
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isMessagesLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#00f3ff]" />
                          </div>
                        ) : messages?.map((m: any) => (
                          <div key={m.id} className={cn("flex flex-col", m.isFromAdmin ? "items-end" : "items-start")}>
                            <div className={cn(
                              "max-w-[80%] p-4 rounded-lg border",
                              m.isFromAdmin 
                                ? "bg-white/5 border-white/10 text-zinc-300"
                                : "bg-[#00f3ff]/5 border-[#00f3ff]/20 text-white" 
                            )}>
                              <div className="text-xs font-mono text-zinc-500 mb-2">
                                {format(new Date(m.createdAt), "HH:mm:ss")} [{m.isFromAdmin ? "ADMIN" : "USER"}]
                              </div>
                              <div className="whitespace-pre-wrap">{m.content}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-4 border-t border-[#00f3ff]/10">
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!replyContent.trim()) return;
                            sendReply({ userId: selectedUserId, content: replyContent });
                            setReplyContent("");
                          }}
                          className="flex gap-4"
                        >
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="管理者としてメッセージを送信..."
                            className="flex-1 bg-black/60 border border-[#00f3ff]/20 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#00f3ff]/50"
                          />
                          <button
                            type="submit"
                            disabled={isSendingReply}
                            className="bg-[#00f3ff] hover:bg-[#00d8e6] disabled:opacity-50 text-black font-bold px-6 py-2 rounded-md flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                          >
                            {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            送信
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                      <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-mono text-sm uppercase tracking-widest">Select a user to monitor communication</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Sidebar / Inquiry List */}
                <div className="lg:col-span-1 bg-black/40 border border-[#00f3ff]/20 rounded-lg overflow-hidden backdrop-blur-sm">
                  <div className="p-4 border-b border-[#00f3ff]/10 bg-[#00f3ff]/5">
                    <h3 className="text-sm font-mono text-[#00f3ff]">INQUIRY_LIST</h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[600px]">
                    {isInquiriesLoading ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00f3ff]/50" />
                      </div>
                    ) : inquiries?.map((inq: any) => (
                      <button
                        key={inq.id}
                        onClick={() => setSelectedInquiryId(inq.id)}
                        className={cn(
                          "w-full p-4 text-left transition-colors border-b border-[#00f3ff]/5 relative",
                          selectedInquiryId === inq.id ? "bg-[#00f3ff]/10" : "hover:bg-white/5"
                        )}
                      >
                        {!inq.status && (
                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        )}
                        <div className="font-medium text-sm text-white mb-1">{inq.name}</div>
                        <div className="text-xs text-[#00f3ff]/60 mb-2">{inq.subject}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {format(new Date(inq.createdAt), "yyyy/MM/dd HH:mm")}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inquiry Content Area */}
                <div className="lg:col-span-3 bg-black/40 border border-[#00f3ff]/20 rounded-lg flex flex-col backdrop-blur-sm min-h-[600px]">
                  {selectedInquiryId ? (
                    <>
                      {(() => {
                        const inq = inquiries?.find(i => i.id === selectedInquiryId);
                        if (!inq) return null;
                        return (
                          <div className="flex-1 flex flex-col">
                            <div className="p-6 border-b border-[#00f3ff]/10 bg-[#00f3ff]/5">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h2 className="text-xl font-bold text-[#00f3ff] mb-1">{inq.subject}</h2>
                                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {inq.name}</span>
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</span>
                                  </div>
                                </div>
                                <div className={cn(
                                  "px-3 py-1 rounded text-[10px] font-mono border",
                                  inq.status 
                                    ? "bg-green-500/10 border-green-500/30 text-green-400" 
                                    : "bg-red-500/10 border-red-500/30 text-red-400"
                                )}>
                                  {inq.status ? "STATUS: REPLIED" : "STATUS: PENDING"}
                                </div>
                              </div>
                              <div className="bg-black/60 p-6 rounded-lg border border-[#00f3ff]/10 text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                {inq.message}
                              </div>
                            </div>

                            <div className="flex-1 p-6 flex flex-col">
                              {inq.status && (
                                <div className="mb-6">
                                  <div className="text-xs font-mono text-[#00f3ff] mb-2">REPLY_HISTORY:</div>
                                  <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 p-4 rounded-lg text-zinc-300 italic">
                                    {inq.reply}
                                  </div>
                                </div>
                              )}

                              <div className="mt-auto">
                                <div className="text-xs font-mono text-[#00f3ff] mb-2 uppercase tracking-widest">
                                  {inq.status ? "Update Reply" : "Send Reply"}
                                </div>
                                <textarea
                                  value={inquiryReply}
                                  onChange={(e) => setInquiryReply(e.target.value)}
                                  placeholder="返信内容を入力してください..."
                                  className="w-full h-40 bg-black/60 border border-[#00f3ff]/20 rounded-md p-4 text-white focus:outline-none focus:border-[#00f3ff]/50 resize-none mb-4"
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => replyToInquiry({ id: selectedInquiryId, reply: inquiryReply })}
                                    disabled={isReplyingInquiry || !inquiryReply.trim()}
                                    className="bg-[#00f3ff] hover:bg-[#00d8e6] disabled:opacity-50 text-black font-bold px-8 py-2 rounded-md flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                                  >
                                    {isReplyingInquiry ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {inq.status ? "再送信" : "返信を送信"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4">
                      <div className="w-16 h-16 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
                        <Mail className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="font-mono text-sm uppercase tracking-widest">Select an inquiry to view details</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
