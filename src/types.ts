export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  ingredients: string[];
  calories: number;
  prepTime: number; // in minutes
  notes: string;
  isFavorite: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface PlannedMeal {
  id: string;
  day: DayOfWeek;
  category: MealCategory;
  mealId: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  isPurchased: boolean;
  isCustom: boolean;
}

export interface UserProfile {
  name: string;
  dailyCalorieGoal: number;
  waterIntakeGoal: number; // in glasses
  profilePicture?: string;
}

export interface AppSettings {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
}

export interface DailyTracking {
  date: string; // YYYY-MM-DD
  waterGlasses: number;
  completedMealIds: string[]; // PlannedMeal IDs
}
