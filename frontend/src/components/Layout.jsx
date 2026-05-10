import React from 'react';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import { Bell, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user } = useAuthStore();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-8 bg-white dark:bg-card border-b border-border shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{greeting()},</p>
            <p className="text-sm font-bold text-foreground leading-tight">{user?.name} 👋</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-muted hover:bg-accent transition-colors"
            >
              {dark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Notifications placeholder */}
            <button className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-muted hover:bg-accent transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
            </button>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, hsl(243 75% 59%), hsl(280 70% 55%))' }}
            >
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-8"
          style={{ background: 'hsl(var(--background))' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
