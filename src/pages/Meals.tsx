import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, Edit2, Trash2, Heart, Clock, Flame, X, Utensils } from 'lucide-react';
import { Meal, MealCategory } from '../types';
import { cn } from '../lib/utils';

export function Meals() {
  const { meals, addMeal, updateMeal, deleteMeal, toggleFavorite } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MealCategory | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  const [mealToDelete, setMealToDelete] = useState<string | null>(null);

  const categories: (MealCategory | 'All')[] = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || meal.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingMeal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setMealToDelete(id);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <h1 className="text-3xl font-display font-bold text-foreground">Meal Library</h1>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search meals..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-colors",
                activeCategory === cat 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-card text-slate-600 border border-border hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">No meals found</h3>
            <p className="text-slate-500">Try adjusting your search or add a new meal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMeals.map(meal => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={meal.id} 
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col group relative"
              >
                {mealToDelete === meal.id && (
                  <div className="absolute inset-0 bg-red-500/95 dark:bg-red-950/95 text-white flex flex-col items-center justify-center p-5 text-center z-10 animate-fade-in">
                    <Trash2 size={32} className="mb-2 text-white animate-bounce" />
                    <p className="font-bold text-base text-white mb-1">Delete this meal?</p>
                    <p className="text-xs text-red-100 mb-4 px-2">This will remove it from your library and planned days.</p>
                    <div className="flex gap-2 w-full max-w-[200px]">
                      <button 
                        onClick={() => setMealToDelete(null)}
                        className="flex-1 py-2 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          deleteMeal(meal.id);
                          setMealToDelete(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-white text-red-600 font-bold hover:bg-red-50 transition-all text-xs shadow-md cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {meal.category}
                    </span>
                    <button 
                      onClick={() => toggleFavorite(meal.id)}
                      className={cn("p-1.5 rounded-full transition-colors", meal.isFavorite ? "text-red-500 bg-red-50 dark:bg-red-500/10" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800")}
                    >
                      <Heart size={20} className={cn(meal.isFavorite && "fill-current")} />
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
                
                <div className="flex border-t border-border bg-slate-50 dark:bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(meal)} className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Edit2 size={16} /> Edit
                  </button>
                  <div className="w-px bg-border"></div>
                  <button onClick={() => handleDelete(meal.id)} className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <MealModal 
            meal={editingMeal} 
            onClose={() => setIsModalOpen(false)} 
            onSave={(mealData) => {
              if (editingMeal) {
                updateMeal(editingMeal.id, mealData);
              } else {
                addMeal({ ...mealData, isFavorite: false } as Omit<Meal, 'id'>);
              }
              setIsModalOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MealModal({ meal, onClose, onSave }: { meal: Meal | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    category: meal?.category || 'Breakfast',
    calories: meal?.calories || '',
    prepTime: meal?.prepTime || '',
    ingredients: meal?.ingredients?.join(', ') || '',
    notes: meal?.notes || ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a meal name.');
      return;
    }
    const caloriesNum = Number(formData.calories);
    if (!formData.calories || isNaN(caloriesNum) || caloriesNum < 0) {
      setError('Please enter a valid calorie value (0 or greater).');
      return;
    }
    const prepNum = Number(formData.prepTime);
    if (!formData.prepTime || isNaN(prepNum) || prepNum < 0) {
      setError('Please enter a valid preparation time (0 or greater).');
      return;
    }
    
    onSave({
      name: formData.name.trim(),
      category: formData.category,
      calories: caloriesNum,
      prepTime: prepNum,
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      notes: formData.notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold font-display">{meal ? 'Edit Meal' : 'Add New Meal'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-500/10 p-3.5 border border-red-200/50 flex gap-2.5 text-sm text-red-600 dark:text-red-400 font-medium">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form id="mealForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meal Name *</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as MealCategory})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Calories (kcal) *</label>
                <input required type="number" min="0" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prep Time (min) *</label>
                <input required type="number" min="0" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ingredients (comma separated)</label>
              <textarea rows={3} value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground" placeholder="Oats, Milk, Banana..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none resize-none text-foreground"></textarea>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button type="submit" form="mealForm" className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary hover:bg-primary-dark shadow-sm transition-colors cursor-pointer">Save Meal</button>
        </div>
      </motion.div>
    </div>
  );
}
// Add missing Utensils import at top by replacing the component
