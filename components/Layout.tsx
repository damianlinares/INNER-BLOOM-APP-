import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, BookOpen, BrainCircuit, Music, User, Menu, Wind, Bot, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

const desktopNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/session', label: 'AI Session', icon: BrainCircuit },
  { path: '/tools', label: 'Wellness Tools', icon: Wind },
  { path: '/community', label: 'Support Circle', icon: User },
  { path: '/progress', label: 'Progress', icon: Sparkles },
  { path: '/journeys', label: 'Journeys', icon: Music },
  { path: '/affirmations', label: 'Affirmations', icon: Music },
];

const mobileNavItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/progress', label: 'Progress', icon: Sparkles },
  { path: '/session', label: 'AI Session', icon: BrainCircuit },
  { path: '/tools', label: 'Tools', icon: Wind },
  { path: '/community', label: 'Profile', icon: User },
];

const GlobalAudioController: React.FC = () => {
    const { activeSoundscape, isSoundscapePlaying, toggleSoundscape, stopSoundscape } = useUser();
    if (!activeSoundscape) return null;

    return (
        <div className="fixed bottom-24 md:bottom-4 right-4 bg-surface/80 backdrop-blur-md p-2 rounded-xl flex items-center shadow-soft z-20 w-48 animate-slide-in-from-left border border-border-color">
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-text-primary">{activeSoundscape.title}</p>
            </div>
        </div>
    );
};

const Layout: React.FC = () => {
  return (
    <div className="md:flex md:h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-surface flex-col p-4 border-r border-border-color hidden md:flex">
        <div className="flex items-center mb-10 pl-2">
          <Sparkles className="w-6 h-6 text-secondary mr-2"/>
          <span className="text-2xl font-semibold text-text-primary">Mind Oasis</span>
        </div>
        <nav className="flex flex-col space-y-2">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'bg-secondary/10 text-secondary font-semibold'
                    : 'text-text-secondary hover:bg-secondary/5 hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md flex items-center justify-between p-4 h-16 z-20 border-b border-border-color/50">
        <div className="flex items-center">
            <Sparkles className="w-6 h-6 text-secondary"/>
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Mind Oasis</h1>
        <Menu className="w-6 h-6 text-text-primary"/>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pt-20 md:pt-8 pb-28 md:pb-8">
        <Outlet />
      </main>

      <GlobalAudioController />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg border-t border-border-color flex justify-around items-center p-2 h-20 z-30 rounded-t-2xl">
        {mobileNavItems.map((item) => {
            if (item.path === '/session') {
                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 transform -translate-y-6 shadow-md border-2 border-border-color/50 ${
                            isActive
                                ? 'bg-secondary text-white'
                                : 'bg-primary text-secondary'
                            }`
                        }
                    >
                        <Bot className="w-8 h-8" />
                    </NavLink>
                )
            }
            return (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors duration-200 ${
                    isActive
                        ? 'text-secondary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`
                }
                >
                    <item.icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
            )
        })}
      </nav>
    </div>
  );
};

export default Layout;