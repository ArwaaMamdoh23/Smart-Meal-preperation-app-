import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meal, PlannedMeal, ShoppingItem, UserProfile, AppSettings, DailyTracking, DayOfWeek, MealCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  logout: () => Promise<void>;

  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => Promise<void>;
  updateMeal: (id: string, meal: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  plannedMeals: PlannedMeal[];
  addPlannedMeal: (day: DayOfWeek, category: MealCategory, mealId: string) => Promise<void>;
  removePlannedMeal: (id: string) => Promise<void>;
  clearDayPlan: (day: DayOfWeek) => Promise<void>;

  shoppingList: ShoppingItem[];
  addShoppingItem: (name: string, isCustom?: boolean) => Promise<void>;
  toggleShoppingItem: (id: string) => Promise<void>;
  deleteShoppingItem: (id: string) => Promise<void>;
  generateShoppingList: () => Promise<void>;
  clearCompletedShoppingItems: () => Promise<void>;

  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  tracking: DailyTracking[];
  todayTracking: DailyTracking;
  addWater: () => Promise<void>;
  removeWater: () => Promise<void>;
  toggleMealCompletion: (plannedMealId: string) => Promise<void>;
}

const defaultMeals: Meal[] = [
  { id: uuidv4(), name: 'Oatmeal with Fruits', category: 'Breakfast', ingredients: ['Oats', 'Milk', 'Banana', 'Berries', 'Honey'], calories: 350, prepTime: 10, notes: 'Quick and healthy breakfast', isFavorite: true },
  { id: uuidv4(), name: 'Chicken Salad', category: 'Lunch', ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive Oil'], calories: 450, prepTime: 15, notes: 'High protein', isFavorite: false },
  { id: uuidv4(), name: 'Grilled Salmon', category: 'Dinner', ingredients: ['Salmon Fillet', 'Asparagus', 'Lemon', 'Garlic', 'Quinoa'], calories: 600, prepTime: 25, notes: 'Rich in Omega-3', isFavorite: true },
  { id: uuidv4(), name: 'Vegetable Soup', category: 'Dinner', ingredients: ['Carrots', 'Potatoes', 'Celery', 'Onion', 'Vegetable Broth'], calories: 250, prepTime: 40, notes: 'Warm and comforting', isFavorite: false },
  { id: uuidv4(), name: 'Greek Yogurt', category: 'Snack', ingredients: ['Greek Yogurt', 'Almonds', 'Honey'], calories: 200, prepTime: 5, notes: 'Good afternoon snack', isFavorite: true },
  { id: uuidv4(), name: 'Pasta with Tomato Sauce', category: 'Lunch', ingredients: ['Whole Wheat Pasta', 'Tomato Sauce', 'Parmesan', 'Basil'], calories: 500, prepTime: 20, notes: 'Classic Italian', isFavorite: false },
];

const defaultProfile: UserProfile = {
  name: 'Healthy Eater',
  dailyCalorieGoal: 2000,
  waterIntakeGoal: 8,
};

const defaultSettings: AppSettings = {
  isDarkMode: false,
  notificationsEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [meals, setMeals] = useState<Meal[]>([]);
  const [plannedMeals, setPlannedMeals] = useState<PlannedMeal[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [tracking, setTracking] = useState<DailyTracking[]>([]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayTracking = tracking.find(t => t.date === todayStr) || {
    date: todayStr,
    waterGlasses: 0,
    completedMealIds: []
  };

  // Theme support
  useEffect(() => {
    if (settings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // 1. Fetch User Profile & Settings
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let currentProfile = defaultProfile;
          let currentSettings = defaultSettings;

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            currentProfile = data.profile || defaultProfile;
            currentSettings = data.settings || defaultSettings;
          } else {
            // New user, write defaults with their displayName if available
            const initialName = currentUser.displayName || defaultProfile.name;
            const newProfile = { ...defaultProfile, name: initialName };
            await setDoc(userDocRef, {
              profile: newProfile,
              settings: defaultSettings,
              createdAt: new Date().toISOString()
            });
            currentProfile = newProfile;
          }
          setProfile(currentProfile);
          setSettings(currentSettings);

          // 2. Fetch Meals
          const mealsColRef = collection(db, 'users', currentUser.uid, 'meals');
          const mealsSnap = await getDocs(mealsColRef);
          let loadedMeals: Meal[] = [];

          if (mealsSnap.empty) {
            // Seed default meals for new user
            const batch = writeBatch(db);
            defaultMeals.forEach((meal) => {
              const mDocRef = doc(db, 'users', currentUser.uid, 'meals', meal.id);
              batch.set(mDocRef, meal);
            });
            await batch.commit();
            loadedMeals = defaultMeals;
          } else {
            mealsSnap.forEach((docSnap) => {
              loadedMeals.push(docSnap.data() as Meal);
            });
          }
          setMeals(loadedMeals);

          // 3. Fetch Planned Meals
          const plannedColRef = collection(db, 'users', currentUser.uid, 'plannedMeals');
          const plannedSnap = await getDocs(plannedColRef);
          const loadedPlanned: PlannedMeal[] = [];
          plannedSnap.forEach((docSnap) => {
            loadedPlanned.push(docSnap.data() as PlannedMeal);
          });
          setPlannedMeals(loadedPlanned);

          // 4. Fetch Shopping List
          const shoppingColRef = collection(db, 'users', currentUser.uid, 'shoppingList');
          const shoppingSnap = await getDocs(shoppingColRef);
          const loadedShopping: ShoppingItem[] = [];
          shoppingSnap.forEach((docSnap) => {
            loadedShopping.push(docSnap.data() as ShoppingItem);
          });
          setShoppingList(loadedShopping);

          // 5. Fetch Daily Tracking
          const trackingColRef = collection(db, 'users', currentUser.uid, 'tracking');
          const trackingSnap = await getDocs(trackingColRef);
          const loadedTracking: DailyTracking[] = [];
          trackingSnap.forEach((docSnap) => {
            loadedTracking.push(docSnap.data() as DailyTracking);
          });
          
          // Ensure today tracking is present
          const hasToday = loadedTracking.some(t => t.date === todayStr);
          if (!hasToday) {
            const newTodayTracking = {
              date: todayStr,
              waterGlasses: 0,
              completedMealIds: []
            };
            const trackingDocRef = doc(db, 'users', currentUser.uid, 'tracking', todayStr);
            await setDoc(trackingDocRef, newTodayTracking);
            loadedTracking.push(newTodayTracking);
          }
          setTracking(loadedTracking);

        } catch (error) {
          console.error("Error loading user data from Firestore:", error);
        }
      } else {
        // Clear everything on signout
        setMeals([]);
        setPlannedMeals([]);
        setShoppingList([]);
        setProfile(defaultProfile);
        setSettings(defaultSettings);
        setTracking([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [todayStr]);

  const logout = async () => {
    await signOut(auth);
  };

  // --- Meals ---
  const addMeal = async (mealData: Omit<Meal, 'id'>) => {
    const id = uuidv4();
    const newMeal: Meal = { ...mealData, id };
    setMeals(prev => [...prev, newMeal]);
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'meals', id);
      await setDoc(docRef, newMeal);
    }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'meals', id);
      await setDoc(docRef, updates, { merge: true });
    }
  };

  const deleteMeal = async (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    setPlannedMeals(prev => prev.filter(p => p.mealId !== id));
    if (user) {
      const mealDocRef = doc(db, 'users', user.uid, 'meals', id);
      await deleteDoc(mealDocRef);

      // Delete associated planned meals
      const plannedToDelete = plannedMeals.filter(p => p.mealId === id);
      for (const p of plannedToDelete) {
        const pDocRef = doc(db, 'users', user.uid, 'plannedMeals', p.id);
        await deleteDoc(pDocRef);
      }
    }
  };

  const toggleFavorite = async (id: string) => {
    const meal = meals.find(m => m.id === id);
    if (!meal) return;
    const newFavorite = !meal.isFavorite;
    setMeals(prev => prev.map(m => m.id === id ? { ...m, isFavorite: newFavorite } : m));
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'meals', id);
      await setDoc(docRef, { isFavorite: newFavorite }, { merge: true });
    }
  };

  // --- Planner ---
  const addPlannedMeal = async (day: DayOfWeek, category: MealCategory, mealId: string) => {
    // Prevent duplicate entries for the same day and category slot
    const existing = plannedMeals.find(p => p.day === day && p.category === category);
    let updatedPlanned = [...plannedMeals];
    
    if (existing) {
      updatedPlanned = updatedPlanned.filter(p => p.id !== existing.id);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'plannedMeals', existing.id);
          await deleteDoc(docRef);
        } catch (error) {
          console.error("Error removing existing planned meal:", error);
        }
      }
    }

    const id = uuidv4();
    const newPlanned: PlannedMeal = { id, day, category, mealId };
    setPlannedMeals([...updatedPlanned, newPlanned]);
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'plannedMeals', id);
        await setDoc(docRef, newPlanned);
      } catch (error) {
        console.error("Error setting planned meal:", error);
      }
    }
  };

  const removePlannedMeal = async (id: string) => {
    setPlannedMeals(prev => prev.filter(p => p.id !== id));
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'plannedMeals', id);
      await deleteDoc(docRef);
    }
  };

  const clearDayPlan = async (day: DayOfWeek) => {
    const itemsToDelete = plannedMeals.filter(p => p.day === day);
    setPlannedMeals(prev => prev.filter(p => p.day !== day));
    if (user) {
      for (const p of itemsToDelete) {
        const docRef = doc(db, 'users', user.uid, 'plannedMeals', p.id);
        await deleteDoc(docRef);
      }
    }
  };

  // --- Shopping List ---
  const addShoppingItem = async (name: string, isCustom = true) => {
    if (!shoppingList.find(i => i.name.toLowerCase() === name.toLowerCase())) {
      const id = uuidv4();
      const newItem: ShoppingItem = { id, name, isPurchased: false, isCustom };
      setShoppingList(prev => [...prev, newItem]);
      if (user) {
        const docRef = doc(db, 'users', user.uid, 'shoppingList', id);
        await setDoc(docRef, newItem);
      }
    }
  };

  const toggleShoppingItem = async (id: string) => {
    const item = shoppingList.find(i => i.id === id);
    if (!item) return;
    const newPurchased = !item.isPurchased;
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, isPurchased: newPurchased } : i));
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'shoppingList', id);
      await setDoc(docRef, { isPurchased: newPurchased }, { merge: true });
    }
  };

  const deleteShoppingItem = async (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'shoppingList', id);
      await deleteDoc(docRef);
    }
  };

  const generateShoppingList = async () => {
    const plannedMealIds = plannedMeals.map(p => p.mealId);
    const ingredients = meals
      .filter(m => plannedMealIds.includes(m.id))
      .flatMap(m => m.ingredients);
    
    const uniqueIngredients = Array.from(new Set<string>(ingredients));
    const newItems: ShoppingItem[] = uniqueIngredients.map(name => ({
      id: uuidv4(),
      name,
      isPurchased: false,
      isCustom: false
    }));

    // Keep custom items, replace generated ones
    const customItems = shoppingList.filter(i => i.isCustom);
    const existingGenerated = shoppingList.filter(i => !i.isCustom);
    
    const mergedGenerated = newItems.map(newItem => {
      const existing = existingGenerated.find(e => e.name.toLowerCase() === newItem.name.toLowerCase());
      return existing ? existing : newItem;
    });

    const finalShoppingList = [...mergedGenerated, ...customItems];
    setShoppingList(finalShoppingList);

    if (user) {
      // Clean old and save new in Firestore
      // For simplicity, batch update or rewrite
      const batch = writeBatch(db);
      
      // Delete existing in collection
      const shoppingColRef = collection(db, 'users', user.uid, 'shoppingList');
      const snap = await getDocs(shoppingColRef);
      snap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      // Write final list
      finalShoppingList.forEach((item) => {
        const itemDocRef = doc(db, 'users', user.uid, 'shoppingList', item.id);
        batch.set(itemDocRef, item);
      });

      await batch.commit();
    }
  };

  const clearCompletedShoppingItems = async () => {
    const completedItems = shoppingList.filter(i => i.isPurchased);
    setShoppingList(prev => prev.filter(i => !i.isPurchased));
    if (user) {
      for (const item of completedItems) {
        const docRef = doc(db, 'users', user.uid, 'shoppingList', item.id);
        await deleteDoc(docRef);
      }
    }
  };

  // --- Profile & Settings ---
  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { profile: newProfile }, { merge: true });
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { settings: newSettings }, { merge: true });
    }
  };

  // --- Tracking ---
  const updateTodayTracking = async (updates: Partial<DailyTracking>) => {
    const exists = tracking.find(t => t.date === todayStr);
    let newTrackingList: DailyTracking[];

    if (exists) {
      newTrackingList = tracking.map(t => t.date === todayStr ? { ...t, ...updates } : t);
    } else {
      newTrackingList = [...tracking, { ...todayTracking, ...updates }];
    }

    setTracking(newTrackingList);

    if (user) {
      const docRef = doc(db, 'users', user.uid, 'tracking', todayStr);
      await setDoc(docRef, { ...todayTracking, ...updates }, { merge: true });
    }
  };

  const addWater = async () => {
    await updateTodayTracking({ waterGlasses: Math.min(todayTracking.waterGlasses + 1, profile.waterIntakeGoal * 2) });
  };

  const removeWater = async () => {
    await updateTodayTracking({ waterGlasses: Math.max(todayTracking.waterGlasses - 1, 0) });
  };
  
  const toggleMealCompletion = async (plannedMealId: string) => {
    const isCompleted = todayTracking.completedMealIds.includes(plannedMealId);
    const newCompleted = isCompleted 
      ? todayTracking.completedMealIds.filter(id => id !== plannedMealId)
      : [...todayTracking.completedMealIds, plannedMealId];
    await updateTodayTracking({ completedMealIds: newCompleted });
  };

  return (
    <AppContext.Provider value={{
      user, authLoading, logout,
      meals, addMeal, updateMeal, deleteMeal, toggleFavorite,
      plannedMeals, addPlannedMeal, removePlannedMeal, clearDayPlan,
      shoppingList, addShoppingItem, toggleShoppingItem, deleteShoppingItem, generateShoppingList, clearCompletedShoppingItems,
      profile, updateProfile,
      settings, updateSettings,
      tracking, todayTracking, addWater, removeWater, toggleMealCompletion
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
