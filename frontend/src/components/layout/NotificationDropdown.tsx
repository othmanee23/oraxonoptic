import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CreditCard, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  Package, 
  UserPlus, 
  CheckCircle,
  FileText,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Notification, 
  NotificationType,
} from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { apiFetch } from "@/lib/api";

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  payment_request: CreditCard,
  subscription_expiring: AlertTriangle,
  subscription_expired: XCircle,
  workshop_ready: Wrench,
  low_stock: Package,
  new_client: UserPlus,
  invoice_created: FileText,
  payment_approved: CheckCircle,
  payment_rejected: XCircle,
};

const colorMap: Record<NotificationType, string> = {
  payment_request: 'text-blue-500',
  subscription_expiring: 'text-amber-500',
  subscription_expired: 'text-destructive',
  workshop_ready: 'text-green-500',
  low_stock: 'text-amber-500',
  new_client: 'text-blue-500',
  invoice_created: 'text-indigo-500',
  payment_approved: 'text-green-500',
  payment_rejected: 'text-destructive',
};

export function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    if (!user) return;
    apiFetch<{
      id: number | string;
      type: NotificationType | string;
      title: string;
      message: string;
      created_at: string;
      read_at?: string | null;
      link?: string | null;
      data?: Record<string, unknown> | null;
    }[]>("/api/notifications")
      .then((data) => {
        const mapped = data.map((notification) => ({
          id: String(notification.id),
          type: notification.type as NotificationType,
          title: notification.title,
          message: notification.message,
          createdAt: notification.created_at,
          read: Boolean(notification.read_at),
          userId: user.id,
          link: notification.link ?? undefined,
          data: notification.data ?? undefined,
        }));
        setNotifications(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  };

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = (notification: Notification) => {
    apiFetch(`/api/notifications/${notification.id}/read`, { method: "PATCH" })
      .then(loadNotifications)
      .catch(() => undefined);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    apiFetch("/api/notifications/read-all", { method: "PATCH" })
      .then(loadNotifications)
      .catch(() => undefined);
  };

  const handleClearAll = () => {
    if (!user) return;
    apiFetch("/api/notifications/clear", { method: "DELETE" })
      .then(loadNotifications)
      .catch(() => undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover z-50">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={handleMarkAllRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Tout lire
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Vider
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.slice(0, 20).map((notification) => {
              const Icon = iconMap[notification.type];
              const color = colorMap[notification.type];
              
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`mt-0.5 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
