'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ProcessProvider } from '@/lib/ProcessContext';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-midnight-900 relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-midnight-900/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-3 left-3 z-40 p-2 bg-midnight-800 border border-blue-500/20 text-slate-400 lg:hidden hover:text-slate-200 hover:border-blue-500/40 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Header />
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-grid">
          <ProcessProvider>{children}</ProcessProvider>
        </div>
      </main>
    </div>
  );
}