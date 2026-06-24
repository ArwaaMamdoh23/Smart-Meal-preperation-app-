import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Calendar, ShoppingCart, Heart, User, Settings, Menu, X, Utensils, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

const navItems = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Meals', path: '/meals', icon: Utensils },
  { name: 'Weekly Planner', path: '/planner', icon: Calendar },
  { name: 'Shopping List', path: '/shopping', icon: ShoppingCart },
  { name: 'Favorites', path: '/favorites', icon: Heart },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { settings } = useAppContext();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Simulate Notifications
  useEffect(() => {
    if (!settings.notificationsEnabled) return;
    
    const messages = [
      "Don't forget to drink water!",
      "Time to plan your meals for tomorrow.",
      "Check out your shopping list.",
      "Stay hydrated! You're doing great."
    ];

    const timer = setInterval(() => {
      setNotificationMsg(messages[Math.floor(Math.random() * messages.length)]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }, 60000); // random notification every minute for demo

    return () => clearInterval(timer);
  }, [settings.notificationsEnabled]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-surface dark:bg-surface-dark overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card dark:bg-card border-r border-border shadow-sm z-10">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Utensils size={16} className="text-white" />
          </div>
          <h1 className="font-sans font-extrabold text-xl tracking-tight uppercase leading-none">Smart Meal</h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 mb-2",
                  isActive 
                    ? "bg-[#E8F5E9] dark:bg-primary/20 text-primary" 
                    : "text-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-primary" : "")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header - Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Utensils size={16} className="text-white" />
            </div>
            <h1 className="font-sans font-extrabold text-lg uppercase tracking-tight leading-none">Smart Meal</h1>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 -mr-2 text-slate-600 dark:text-slate-300">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[65px] left-0 right-0 bg-card dark:bg-card border-b border-border shadow-lg z-30 md:hidden"
            >
              <nav className="flex flex-col p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <Icon size={20} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Toast */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -50, x: '-50%' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 w-max max-w-[90%]"
            >
              <Bell size={18} className="animate-pulse" />
              <p className="text-sm font-medium">{notificationMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
