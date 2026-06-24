import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Moon, Sun, Bell, BellOff, Shield, Database, X, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const { settings, updateSettings, logout } = useAppContext();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleReset = async () => {
    localStorage.clear();
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
    window.location.reload();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
      <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
      
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        
        {/* Appearance */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-lg">
              {settings.isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <h2 className="text-lg font-bold">Appearance</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-slate-500">Switch to a dark theme to save your eyes at night.</p>
            </div>
            <button 
              onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
              className={cn(
                "w-14 h-8 rounded-full relative transition-colors duration-300",
                settings.isDarkMode ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm",
                settings.isDarkMode ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-lg">
              {settings.notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
            </div>
            <h2 className="text-lg font-bold">Notifications</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Reminders</p>
              <p className="text-sm text-slate-500">Get gentle nudges to drink water and plan meals.</p>
            </div>
            <button 
              onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
              className={cn(
                "w-14 h-8 rounded-full relative transition-colors duration-300",
                settings.notificationsEnabled ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm",
                settings.notificationsEnabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>

        {/* Data & Privacy (Mock) */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
              <Database size={20} />
            </div>
            <h2 className="text-lg font-bold">Data & Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Export Data</p>
                <p className="text-sm text-slate-500">Download all your plans and meals as JSON.</p>
              </div>
              <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Export
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-red-500">Clear All Data</p>
                <p className="text-sm text-slate-500">Permanently delete your profile and meals.</p>
              </div>
              <button 
                className="px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" 
                onClick={() => setIsResetConfirmOpen(true)}
              >
                Reset App
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 border border-border">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Reset Application?</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to reset the app? This will sign you out and clear all local cached preferences. Your cloud-hosted profile data will remain secure on Firebase.
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors text-sm cursor-pointer"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
