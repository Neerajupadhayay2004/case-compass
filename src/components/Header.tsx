import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Bell, 
  Settings, 
  Search,
  User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileSidebarTrigger } from "./Sidebar";
import { NotificationPanel } from "./NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMobileMenuClick && (
            <MobileSidebarTrigger onClick={onMobileMenuClick} />
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent animate-pulse">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg leading-none">KnowledgeIQ</h1>
              <p className="text-xs text-muted-foreground">Intelligent Case Assistant</p>
            </div>
          </div>
          <Badge variant="glass" className="hidden md:flex ml-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
            AI Connected
          </Badge>
        </div>

        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search knowledge base..." 
              className="pl-9 bg-secondary/50 border-border focus:border-primary transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
            <NotificationPanel 
              isOpen={isNotificationOpen} 
              onClose={() => setIsNotificationOpen(false)} 
            />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Claims Specialist</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
