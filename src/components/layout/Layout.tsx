import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIChatbot } from '@/components/chatbot/AIChatbot';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      
      <main className="lg:ml-64 min-h-screen flex flex-col">
        <Header title={title} subtitle={subtitle} />
        
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
      
      <AIChatbot />
    </div>
  );
}
