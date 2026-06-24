import React from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { Flame, Droplets, Utensils, ArrowRight, Lightbulb, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export function Home() {
  const { profile, tracking, todayTracking, addWater, removeWater, plannedMeals, meals, toggleMealCompletion } = useAppContext();
  
  const today = format(new Date(), 'EEEE');
  const todayPlanned = plannedMeals.filter(p => p.day === today);
  
  // Calculate today's total calories
  const todayCalories = todayPlanned.reduce((total, plan) => {
    const meal = meals.find(m => m.id === plan.mealId);
    return total + (meal?.calories || 0);
  }, 0);

  // Generate chart data for the last 7 days
  const chartData = [...tracking].slice(-7).map(t => ({
    name: format(new Date(t.date), 'EEE'),
    water: t.waterGlasses,
    meals: t.completedMealIds.length
  }));

  const tips = [
    "Drink a glass of water before each meal.",
    "Try to include vegetables in at least two meals today.",
    "Eating slowly can help you feel full faster.",
    "Meal prepping saves time and reduces stress.",
    "Don't skip breakfast! It jumpstarts your metabolism."
  ];
  const dailyTip = tips[new Date().getDay() % tips.length];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-12">
        <h1 className="text-[3rem] md:text-[5rem] font-[800] leading-[0.9] tracking-[-0.04em] uppercase text-foreground">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},<br/>
          <span className="font-display text-primary italic font-[900]">{profile.name.split(' ')[0]}.</span>
        </h1>
        <div className="text-right mt-4 md:mt-0">
          <div className="font-semibold text-foreground mb-1">{format(new Date(), 'MMM d, yyyy')}</div>
          <div className="bg-[#E8F5E9] text-primary px-3 py-1 rounded-full text-xs font-bold inline-block">
            Healthy Streak: {tracking.filter(t => t.completedMealIds.length > 0).length} Days
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Today's Meals */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-card rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col flex-1 border border-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-[800] text-foreground">Today's Meals</h2>
              <Link to="/planner" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                + Edit Plan
              </Link>
            </div>
            
            <div className="flex-1">
              {todayPlanned.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted mb-4">No meals planned today</p>
                  <Link to="/planner" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity inline-block">
                    Plan Meals
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col">
                  {todayPlanned.map((plan, index) => {
                    const meal = meals.find(m => m.id === plan.mealId);
                    if (!meal) return null;
                    const isCompleted = todayTracking.completedMealIds.includes(plan.id);

                    return (
                      <div 
                        key={plan.id}
                        className={cn(
                          "flex items-center py-4 border-b border-[#F3F4F6] dark:border-border transition-colors",
                          index === todayPlanned.length - 1 ? "border-none" : "",
                          isCompleted ? "opacity-60" : ""
                        )}
                      >
                        <button 
                          onClick={() => toggleMealCompletion(plan.id)}
                          className={cn(
                            "shrink-0 focus:outline-none transition-colors mr-4",
                            isCompleted ? "text-primary" : "text-muted hover:text-primary/50"
                          )}
                        >
                          {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                        <span className="text-xs uppercase tracking-[0.1em] text-muted w-24 shrink-0 font-semibold hidden sm:block">{plan.category}</span>
                        <span className={cn("font-semibold flex-1 text-lg text-foreground px-2", isCompleted ? "line-through" : "")}>{meal.name}</span>
                        <span className="font-[800] text-primary">{meal.calories} kcal</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Link to="/shopping" className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-opacity inline-block self-start mt-6">
              Generate Shopping List
            </Link>
          </div>
        </div>

        {/* Right Column Stats & Tips */}
        <div className="flex flex-col gap-6 h-full">
          {/* Calories Stat */}
          <div className="bg-card rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center border border-border flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase mb-6 text-muted">Daily Progress</h3>
            <div className="w-[120px] h-[120px] rounded-full border-[8px] border-[#E8F5E9] dark:border-slate-800 flex flex-col items-center justify-center mb-4 relative" style={{borderTopColor: 'var(--color-primary)'}}>
              <span className="text-2xl font-[800] text-foreground">{todayCalories}</span>
              <span className="text-[10px] text-muted uppercase tracking-[0.05em] font-bold">Calories</span>
            </div>
            <p className="text-sm text-muted font-medium">{Math.round((todayCalories / profile.dailyCalorieGoal) * 100)}% of your {profile.dailyCalorieGoal} kcal goal</p>
          </div>

          {/* Water Intake */}
          <div className="bg-card rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-border">
            <h3 className="text-sm font-bold uppercase mb-4 text-muted flex justify-between items-center">
              Water Intake
              <div className="flex gap-2">
                <button onClick={removeWater} className="text-muted hover:text-foreground font-bold">-</button>
                <button onClick={addWater} className="text-primary hover:text-primary-dark font-bold">+</button>
              </div>
            </h3>
            <div className="flex gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => {
                const filled = i < Math.min(todayTracking.waterGlasses, 8);
                return (
                  <div key={i} className={cn("flex-1 h-10 rounded-lg transition-colors duration-300", filled ? "bg-[#E3F2FD] dark:bg-blue-900/40" : "bg-[#F3F4F6] dark:bg-slate-800")}></div>
                );
              })}
            </div>
            <p className="text-xl font-[800] text-foreground">{todayTracking.waterGlasses * 0.25} <span className="text-sm font-normal text-muted">Liters</span></p>
          </div>

          {/* Tip Box */}
          <div className="bg-foreground text-card rounded-[20px] p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
            <div className="absolute -top-4 -right-4 text-[6rem] font-[800] opacity-10 select-none">i</div>
            <h4 className="font-[800] text-sm uppercase mb-2 text-primary relative z-10">Tip of the day</h4>
            <p className="text-sm leading-relaxed opacity-90 font-medium relative z-10">{dailyTip}</p>
          </div>
        </div>
      </div>

      {/* Full Width Chart at Bottom */}
      <div className="bg-card rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-border">
        <h3 className="text-sm font-bold uppercase mb-6 text-muted">Weekly Activity</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                itemStyle={{ color: '#1B211E', fontWeight: 800 }}
              />
              <Area type="monotone" dataKey="meals" stroke="#4CAF50" strokeWidth={3} fillOpacity={1} fill="url(#colorMeals)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
