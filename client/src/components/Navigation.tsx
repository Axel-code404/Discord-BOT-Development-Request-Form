import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { LogOut, Terminal, Bell, MonitorSmartphone, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const { mutate: markRead } = useMutation({
    mutationFn: async (id: number) => {
      await fetch(buildUrl(api.notifications.markRead.path, { id }), {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const handleNotificationClick = (n: any) => {
    setSelectedNotification(n);
    if (!n.read) {
      markRead(n.id);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/40 backdrop-blur-md z-50 px-6 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center gap-2 cursor-pointer group">
          <MonitorSmartphone className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
          <h1 className="text-xl font-sci-fi text-white tracking-widest">
            NEXUS<span className="text-primary">BOT</span>
          </h1>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        {user && (
          <>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-white/10 flex items-center justify-between">
                    <span className="text-xs font-sci-fi text-white tracking-widest uppercase">通知センター</span>
                    {unreadCount > 0 && <span className="text-[10px] text-primary">{unreadCount}件の未読</span>}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                    {notifications?.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground font-mono italic">通知はありません</div>
                    ) : (
                      notifications?.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className={cn(
                            "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative",
                            !n.read && "bg-primary/5"
                          )}
                          data-testid={`notification-item-${n.id}`}
                        >
                          {!n.read && <div className="absolute left-1 top-4 w-1 h-8 bg-primary rounded-full" />}
                          <h4 className="text-xs font-bold text-white mb-1">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                          <span className="text-[8px] text-muted-foreground/50 font-mono italic">
                            {format(new Date(n.createdAt), "yyyy/MM/dd HH:mm")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{user.firstName?.[0] || 'U'}</span>
              </div>
              <span className="text-sm font-mono text-white/90">{user.firstName || user.email?.split("@")[0]}</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-red-400 transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">ログアウト</span>
            </button>
          </>
        )}
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" data-testid="notification-modal">
          <div className="w-full max-w-lg bg-black/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <h3 className="text-sm font-sci-fi text-white tracking-widest">{selectedNotification.title}</h3>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
                data-testid="button-close-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap mb-4">
                {selectedNotification.message}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground font-mono italic">
                  受信時刻: {format(new Date(selectedNotification.createdAt), "yyyy/MM/dd HH:mm")}
                </span>
                <Link href="/contact">
                  <button 
                    onClick={() => setSelectedNotification(null)}
                    className="text-xs font-tech text-primary hover:underline"
                    data-testid="link-contact-history"
                  >
                    お問い合わせ履歴を確認
                  </button>
                </Link>
              </div>
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end shrink-0">
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                data-testid="button-close-modal-footer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
