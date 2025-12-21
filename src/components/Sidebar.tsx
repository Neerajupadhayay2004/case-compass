import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  History, 
  BookOpen,
  Settings,
  HelpCircle,
  ChevronRight,
  X,
  Menu,
  MessageSquare
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null },
  { icon: MessageSquare, label: "AI Chat", path: "/chat", badge: "New" },
  { icon: FileText, label: "Active Cases", path: "/cases", badge: "12" },
  { icon: FolderOpen, label: "Documents", path: "/documents", badge: null },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge", badge: null },
  { icon: History, label: "History", path: "/history", badge: null },
];

const bottomItems = [
  { icon: HelpCircle, label: "Help & Support", path: "#" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    if (path !== "#") {
      navigate(path);
      onMobileClose?.();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-64 border-r border-border bg-card/30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:h-[calc(100vh-64px)]
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-11 transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-foreground border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === "New" ? "info" : "secondary"} 
                    className="text-[10px] h-5 animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-4 w-4 animate-fade-in" />}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
                  isActive 
                    ? "text-foreground bg-secondary/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-colors">
            <p className="text-xs font-medium text-foreground mb-1">AI Usage Today</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold gradient-text">47</span>
              <span className="text-xs text-muted-foreground mb-1">queries</span>
            </div>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full w-[47%] bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                style={{ animation: 'slideRight 1s ease-out' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">53 remaining today</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden hover:scale-105 transition-transform" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}
