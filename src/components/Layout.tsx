import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
      <div className="flex">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onMobileClose={() => setIsMobileMenuOpen(false)} 
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto min-h-[calc(100vh-64px)] scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
