
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, BookOpen, MessageSquare, Zap, BarChart2, Users, Play, Pause, X, Compass } from 'lucide-react';
import { useUser } from '../context/UserContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/session', label: 'AI Session', icon: MessageSquare },
  { path: '/tools', label: 'Wellness Tools', icon: Zap },
  { path: '/community', label: 'Support Circle', icon: Users },
  { path: '/progress', label: 'Progress', icon: BarChart2 },
  { path: '/journeys', label: 'Journeys', icon: Compass },
];

const GlobalAudioController = () => {
    const { activeSoundscape, isSoundscapePlaying, toggleSoundscape, stopSoundscape } = useUser();

    if (!activeSoundscape) {
        return null;
    }

    return (
        <div className="mt-auto bg-base p-2 rounded-lg flex items-center justify-between">
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-text-primary">{activeSoundscape.title}</p>
                <p className="text-xs text-text-secondary">Playing...</p>
            </div>
            <div className="flex items-center">
                <button onClick={toggleSoundscape} className="text-text-secondary hover:text-text-primary p-1">
                    {isSoundscapePlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={stopSoundscape} className="text-text-secondary hover:text-text-primary p-1">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};


const Layout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-surface/70 backdrop-blur-lg flex flex-col p-4 border-r border-text-primary/10">
        <div className="flex items-center mb-10">
          <span className="text-2xl font-serif font-bold text-text-primary">Inner Bloom</span>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-white font-semibold'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <GlobalAudioController />
      </aside>
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-base via-base to-surface/20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;