import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Target, Droplets, Camera, Save, Activity, Heart, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile() {
  const { profile, updateProfile, tracking, meals, logout } = useAppContext();
  const [formData, setFormData] = useState({
    name: profile.name,
    dailyCalorieGoal: profile.dailyCalorieGoal.toString(),
    waterIntakeGoal: profile.waterIntakeGoal.toString()
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      dailyCalorieGoal: Number(formData.dailyCalorieGoal),
      waterIntakeGoal: Number(formData.waterIntakeGoal)
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Stats calculation
  const totalWater = tracking.reduce((sum, t) => sum + t.waterGlasses, 0);
  const totalMealsCompleted = tracking.reduce((sum, t) => sum + t.completedMealIds.length, 0);
  const favoriteCount = meals.filter(m => m.isFavorite).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-bold text-foreground">My Profile</h1>
        <button
          onClick={logout}
          className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center gap-2 cursor-pointer border border-red-200 dark:border-red-500/20"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="h-32 bg-primary/20 relative"></div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 left-6 bg-card p-1.5 rounded-full border border-border shadow-md">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 relative overflow-hidden group">
                  {profile.profilePicture ? (
                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => updateProfile({ profilePicture: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <Camera size={24} className="text-white" />
                  </label>
                </div>
              </div>
              
              <div className="mt-12">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none max-w-md" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Target size={16} className="text-orange-500" /> Daily Calories
                      </label>
                      <input 
                        required 
                        type="number" 
                        min="500" 
                        step="50"
                        value={formData.dailyCalorieGoal} 
                        onChange={e => setFormData({...formData, dailyCalorieGoal: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Droplets size={16} className="text-blue-500" /> Daily Water (glasses)
                      </label>
                      <input 
                        required 
                        type="number" 
                        min="1" 
                        max="20"
                        value={formData.waterIntakeGoal} 
                        onChange={e => setFormData({...formData, waterIntakeGoal: e.target.value})} 
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button 
                      type="submit" 
                      className="bg-primary text-white px-6 py-2.5 rounded-full font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                    {isSaved && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="text-primary font-medium text-sm"
                      >
                        Profile updated!
                      </motion.span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-card rounded-3xl border border-border shadow-sm p-6">
            <h3 className="font-bold font-display flex items-center gap-2 mb-6 text-lg">
              <Activity size={20} className="text-primary" /> Lifetime Stats
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{totalWater}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Glasses Drank</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{totalMealsCompleted}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Meals Completed</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <Heart size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">{favoriteCount}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Favorite Recipes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
