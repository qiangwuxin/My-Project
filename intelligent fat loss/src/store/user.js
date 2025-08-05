import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doLogin } from '../api/user.js';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isLogin: false,
      login: async (userData) => {
        try {
          const res = await doLogin(userData);
          
          if (!res.data) {
            throw new Error('登录响应无效');
          }
          
          const { token, data: user } = res.data;
          localStorage.setItem('token', token);
          
          // 添加id字段用于缓存键
          const fullUser = { 
            ...userData, 
            ...user, 
            id: user.id || Date.now().toString() 
          };
          
          set({
            user: fullUser,
            isLogin: true,
          });
          
          return fullUser;
        } catch (error) {
          console.error('登录失败:', error);
          throw new Error('登录失败: ' + error.message);
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isLogin: false });
      }
    }),
    {
      name: 'user-storage', // 本地存储键名
      getStorage: () => localStorage, // 使用localStorage
    }
  )
);