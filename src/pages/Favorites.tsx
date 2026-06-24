import React from 'react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { Heart, Clock, Flame, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export function Favorites() {
  const { meals, toggleFavorite } = useAppContext();
  
  const favoriteMeals = meals.filter(m => m.isFavorite);

  return (
    <div className="space-y-6 pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Favorite Recipes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your most loved meals in one place.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {favoriteMeals.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm">
            <div className="bg-red-50 dark:bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No favorites yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Browse your meal library and tap the heart icon to save your favorite recipes here.</p>
            <Link to="/meals" className="bg-primary text-white px-6 py-2.5 rounded-full font-medium shadow-sm hover:bg-primary-dark transition-colors inline-block">
              Browse Meals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteMeals.map(meal => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={meal.id} 
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col group hover:border-red-200 dark:hover:border-red-900/50 transition-colors"
              >
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {meal.category}
                    </span>
                    <button 
                      onClick={() => toggleFavorite(meal.id)}
                      className="p-1.5 rounded-full text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <Heart size={20} className="fill-current" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">{meal.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{meal.notes || meal.ingredients.join(', ')}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Flame size={16} className="text-orange-500" />
                      <span>{meal.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-blue-500" />
                      <span>{meal.prepTime} min</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
