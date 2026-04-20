import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Settings, 
  LogOut,
  Search, 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

const navItems = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { name: 'Library', path: '/library', icon: <Search size={20} /> },
  { name: 'Pantry', path: '/pantry', icon: <UtensilsCrossed size={20} /> },
  { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex w-64 bg-slate-900 flex-col text-white sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-black tracking-tight text-orange-500">NutriFlow</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="md:hidden font-bold text-orange-600">NutriFlow</div>
          <div className="hidden md:block text-sm text-gray-400 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user?.displayName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Premium Plan</p>
            </div>
            <img 
              src={user?.photoURL || ''} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-orange-100 p-0.5 shadow-sm"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};