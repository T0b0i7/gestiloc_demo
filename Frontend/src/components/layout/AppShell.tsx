import { ReactNode, useEffect, useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "../ChatWidget";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 transition-all duration-300 ${isScrolled ? 'pt-20' : 'pt-0'}`}>
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
