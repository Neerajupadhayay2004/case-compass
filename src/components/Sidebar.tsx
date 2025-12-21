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
  Menu
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null },
  { icon: FileText, label: "Active Cases", path: "/cases", badge: "12" },
  { icon: FolderOpen, label: "Documents", path: "/documents", badge: null },
  { icon: BookOpen, label: "Knowledge Base", path: "/knowledge", badge: "New" },
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
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
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
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.label}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-11 ${
                  isActive ? "bg-secondary/80 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badge === "New" ? "info" : "secondary"} 
                    className="text-[10px] h-5"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="h-4 w-4" />}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {bottomItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="p-4 rounded-lg bg-secondary/30 border border-primary/20">
            <p className="text-xs font-medium text-foreground mb-1">AI Usage Today</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold gradient-text">47</span>
              <span className="text-xs text-muted-foreground mb-1">queries</span>
            </div>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-[47%] bg-gradient-to-r from-primary to-accent rounded-full" />
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
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}
