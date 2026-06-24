import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Check, Trash2, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function ShoppingList() {
  const { 
    shoppingList, 
    plannedMeals,
    addShoppingItem, 
    toggleShoppingItem, 
    deleteShoppingItem, 
    generateShoppingList, 
    clearCompletedShoppingItems 
  } = useAppContext();
  const [newItem, setNewItem] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error', message: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addShoppingItem(newItem.trim());
      setNewItem('');
      setNotification({
        type: 'success',
        message: `"${newItem.trim()}" has been added to your shopping list.`
      });
    }
  };

  const handleAutoGenerate = async () => {
    setNotification(null);
    try {
      await generateShoppingList();
      if (plannedMeals.length === 0) {
        setNotification({
          type: 'info',
          message: 'Your Weekly Planner is currently empty. Please assign meals in the Planner tab first to auto-generate ingredients!'
        });
      } else {
        setNotification({
          type: 'success',
          message: 'Ingredients successfully compiled from your weekly meal plan!'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to generate shopping list.'
      });
    }
  };

  const purchasedCount = shoppingList.filter(i => i.isPurchased).length;
  const totalCount = shoppingList.length;
  const progress = totalCount === 0 ? 0 : (purchasedCount / totalCount) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Shopping List</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generated from your weekly plan.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleAutoGenerate}
            className="flex-1 md:flex-none bg-primary/10 text-primary px-4 py-2.5 rounded-xl font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw size={18} />
            <span className="whitespace-nowrap">Auto Generate</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-start justify-between gap-3 border shadow-sm",
              notification.type === 'success' && "bg-emerald-50 border-emerald-150 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-350",
              notification.type === 'info' && "bg-blue-50 border-blue-150 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-350",
              notification.type === 'error' && "bg-red-50 border-red-150 text-red-800 dark:bg-red-950/20 dark:border-red-900 dark:text-red-350"
            )}
          >
            <div className="flex gap-2.5">
              <span className="text-base select-none">
                {notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-full"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card rounded-3xl border border-border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Stats */}
        <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Progress</h3>
            <span className="text-sm font-medium text-slate-500">{purchasedCount} of {totalCount} items</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="p-4 border-b border-border">
          <form onSubmit={handleAdd} className="relative">
            <input 
              type="text" 
              placeholder="Add custom item..." 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none"
            />
            <button 
              type="submit"
              disabled={!newItem.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              <Plus size={18} />
            </button>
          </form>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {shoppingList.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ShoppingCart size={28} />
              </div>
              <h3 className="text-lg font-medium mb-1">Your list is empty</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">Add items manually or auto-generate from your weekly meal plan.</p>
            </div>
          ) : (
            <AnimatePresence>
              {shoppingList.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    item.isPurchased 
                      ? "bg-slate-50 dark:bg-slate-900/50 border-transparent" 
                      : "bg-card border-border shadow-sm hover:border-primary/30"
                  )}
                >
                  <button 
                    onClick={() => toggleShoppingItem(item.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      item.isPurchased ? "bg-primary border-primary text-white" : "border-slate-300 dark:border-slate-600 text-transparent hover:border-primary"
                    )}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                  <span className={cn(
                    "flex-1 font-medium transition-all",
                    item.isPurchased ? "text-slate-400 line-through" : "text-foreground"
                  )}>
                    {item.name}
                  </span>
                  {item.isCustom && !item.isPurchased && (
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase tracking-wider hidden sm:block">Custom</span>
                  )}
                  <button 
                    onClick={() => deleteShoppingItem(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Actions */}
        {purchasedCount > 0 && (
          <div className="p-4 border-t border-border bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center shrink-0">
            <span className="text-sm font-medium text-slate-500">{purchasedCount} completed</span>
            <button 
              onClick={clearCompletedShoppingItems}
              className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} /> Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
