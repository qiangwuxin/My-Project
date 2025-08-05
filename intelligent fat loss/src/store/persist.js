import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePersistStore = create(
  persist(
    (set, get) => ({
      dietPlans: {},
      sportPlans: {},
      completedExercises: {},
      // 新增饮食日志相关状态
      foodLogs: {},          // 食物日志
      dailyCalories: {},     // 每日总热量
      mealCalories: {},      // 每餐热量
      
      setDietPlan: (userId, plan) => set({
        dietPlans: { 
          ...get().dietPlans, 
          [userId]: plan 
        }
      }),
      
      setSportPlan: (userId, plan) => set({
        sportPlans: { 
          ...get().sportPlans, 
          [userId]: plan 
        }
      }),
      
      setCompletedExercises: (userId, exercises) => set({
        completedExercises: { 
          ...get().completedExercises, 
          [userId]: exercises 
        }
      }),
      
      // 新增: 设置食物日志
      setFoodLogs: (userId, logs) => set({
        foodLogs: {
          ...get().foodLogs,
          [userId]: logs
        }
      }),
      
      // 新增: 设置每日总热量
      setDailyCalories: (userId, calories) => set({
        dailyCalories: {
          ...get().dailyCalories,
          [userId]: calories
        }
      }),
      
      // 新增: 设置每餐热量
      setMealCalories: (userId, calories) => set({
        mealCalories: {
          ...get().mealCalories,
          [userId]: calories
        }
      }),
    }),
    {
      name: 'app-storage', // 本地存储键名
      getStorage: () => localStorage, // 使用localStorage
    }
  )
);