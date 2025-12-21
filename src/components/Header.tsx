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

interface HeaderProps {
  onMobileMenuClick?: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onMobileMenuClick && (
            <MobileSidebarTrigger onClick={onMobileMenuClick} />
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
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
              className="pl-9 bg-secondary/50 border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">Claims Specialist</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
