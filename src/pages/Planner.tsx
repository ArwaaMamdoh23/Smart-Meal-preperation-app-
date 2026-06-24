import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DayOfWeek, MealCategory, Meal } from '../types';
import { cn } from '../lib/utils';
import { Plus, X, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const categories: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function Planner() {
  const { meals, plannedMeals, addPlannedMeal, removePlannedMeal, clearDayPlan } = useAppContext();
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');
  const [selectorOpen, setSelectorOpen] = useState<{day: DayOfWeek, cat: MealCategory} | null>(null);

  const getPlannedMeal = (day: DayOfWeek, category: MealCategory) => {
    const plan = plannedMeals.find(p => p.day === day && p.category === category);
    if (!plan) return null;
    return {
      planId: plan.id,
      meal: meals.find(m => m.id === plan.mealId)
    };
  };

  const dayCalories = (day: DayOfWeek) => {
    return categories.reduce((total, cat) => {
      const pMeal = getPlannedMeal(day, cat);
      return total + (pMeal?.meal?.calories || 0);
    }, 0);
  };

  const handleSelectMeal = (mealId: string) => {
    if (selectorOpen) {
      addPlannedMeal(selectorOpen.day, selectorOpen.cat, mealId);
      setSelectorOpen(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Weekly Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your meals for the week ahead.</p>
        </div>
      </div>

      {/* Days Tabs for Mobile / Grid Header for Desktop */}
      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0 md:hidden">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={cn(
              "px-5 py-3 rounded-xl whitespace-nowrap font-medium transition-colors shadow-sm border",
              activeDay === day 
                ? "bg-primary text-white border-primary" 
                : "bg-card text-slate-600 border-border"
            )}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Main Grid / List */}
      <div className="flex-1 min-h-0 bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Desktop Sidebar Days */}
        <div className="hidden md:flex flex-col w-64 border-r border-border bg-slate-50/50 dark:bg-slate-900/20">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "p-4 text-left font-medium border-b border-border transition-colors flex justify-between items-center",
                activeDay === day 
                  ? "bg-primary/10 text-primary border-l-4 border-l-primary" 
                  : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent"
              )}
            >
              <span>{day}</span>
              <span className="text-xs font-normal text-slate-400 bg-slate-200/50 dark:bg-slate-700 px-2 py-1 rounded-full">
                {dayCalories(day)} kcal
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 bg-background">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-display">{activeDay}</h2>
            <button 
              onClick={() => clearDayPlan(activeDay)}
              className="text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear Day
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {categories.map(cat => {
              const pMeal = getPlannedMeal(activeDay, cat);
              return (
                <div key={cat} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col h-40 relative group transition-colors hover:border-primary/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-primary uppercase tracking-wider">{cat}</span>
                    {pMeal && (
                      <button 
                        onClick={() => removePlannedMeal(pMeal.planId)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  
                  {pMeal && pMeal.meal ? (
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-lg mb-1">{pMeal.meal.name}</h4>
                      <p className="text-slate-500 text-sm line-clamp-2">{pMeal.meal.ingredients.join(', ')}</p>
                      <div className="mt-auto pt-2 flex gap-3 text-xs font-medium text-slate-500">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{pMeal.meal.calories} kcal</span>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{pMeal.meal.prepTime} min</span>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSelectorOpen({ day: activeDay, cat })}
                      className="flex-1 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all group-hover:border-primary/50"
                    >
                      <Plus size={24} className="mb-2" />
                      <span className="font-medium text-sm">Assign Meal</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meal Selector Modal */}
      <AnimatePresence>
        {selectorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                <h2 className="text-lg font-bold">Select {selectorOpen.cat} for {selectorOpen.day}</h2>
                <button onClick={() => setSelectorOpen(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-2 overflow-y-auto flex-1 bg-surface dark:bg-surface-dark">
                {meals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 mb-4">You don't have any meals yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Prefer same category first, then others */}
                    {meals
                      .sort((a, b) => {
                        if (a.category === selectorOpen.cat && b.category !== selectorOpen.cat) return -1;
                        if (a.category !== selectorOpen.cat && b.category === selectorOpen.cat) return 1;
                        return 0;
                      })
                      .map(meal => (
                      <button 
                        key={meal.id}
                        onClick={() => handleSelectMeal(meal.id)}
                        className="w-full text-left p-4 bg-card rounded-xl border border-border hover:border-primary shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold">{meal.name}</h4>
                            {meal.category === selectorOpen.cat && (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Recommended</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-[250px] md:max-w-xs">{meal.ingredients.join(', ')}</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">{meal.calories} kcal</span>
                          <span className="block text-xs text-slate-500">{meal.prepTime} min</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
