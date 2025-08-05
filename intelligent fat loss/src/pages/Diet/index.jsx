import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../store/user';
import { usePersistStore } from '../../store/persist';
import { getDietPlan } from '../../api/ai/getDietPlan';
import { getCalories } from '../../api/ai/getCalorie';
import { getCaloriesFromText } from '../../api/ai/getCaloriesFromText';
import CalorieDashboard from '../../components/CalorieDashboard';
import './Diet.styl';

const Diet = () => {
  const { user } = useUserStore();
  const persistStore = usePersistStore();
  
  const [dietPlan, setDietPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [manualFood, setManualFood] = useState('');
  const fileInputRef = useRef(null);

  // 从持久化存储中获取饮食日志状态
  const foodLogs = persistStore.foodLogs[user?.id] || Array(7).fill([]);
  const dailyCalories = persistStore.dailyCalories[user?.id] || Array(7).fill(0);
  const mealCalories = persistStore.mealCalories[user?.id] || 
    Array(7).fill().map(() => ({
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    }));

  // 获取饮食计划
  useEffect(() => {
    if (!user) return;
    
    const fetchDietPlan = async () => {
      setLoading(true);
      setError('');
      
      try {
        // 检查缓存
        const cachedPlan = persistStore.dietPlans[user.id];
        const now = Date.now();
        
        // 如果缓存存在且未过期（24小时）
        if (cachedPlan && now - cachedPlan.timestamp < 24 * 60 * 60 * 1000) {
          setDietPlan(cachedPlan.data);
          setLoading(false);
          return;
        }
        
        // 获取新计划
        const plan = await getDietPlan({
          height: user.height,
          weight: user.weight,
          targetWeight: user.targetweight,
          age: user.age,
          activityType: user.sportType,
          bodyType: user.bodyType
        });
        
        // 更新状态
        setDietPlan(plan);
        
        // 保存到持久化存储
        persistStore.setDietPlan(user.id, {
          data: plan,
          timestamp: now
        });
      } catch (err) {
        let errorMsg = '获取饮食计划失败: ' + err.message;
        
        if (err.message.includes('网络错误')) {
          errorMsg += ' - 请检查您的网络连接';
        } else if (err.message.includes('服务器错误')) {
          errorMsg += ' - 请稍后再试';
        } else if (err.message.includes('无法连接到服务器')) {
          errorMsg += ' - 可能是API服务不可用';
        } else if (err.message.includes('CORS')) {
          errorMsg += ' - 跨域问题，请确保代理配置正确';
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [user, persistStore]);

  // 处理图片上传分析
  const handleImageUpload = async (e) => {
    try {
      const foodData = await getCalories(e);
      addFoodToLog(foodData);
    } catch (err) {
      setError('食物识别失败: ' + err.message);
    }
  };

  // 处理文本分析
  const handleTextAnalysis = async () => {
    if (!manualFood.trim()) return;
    
    setError('');
    
    try {
      const foodData = await getCaloriesFromText(manualFood);
      addFoodToLog(foodData);
      setManualFood('');
    } catch (err) {
      setError('分析食物热量失败: ' + err.message);
    }
  };

  // 添加食物到日志
  const addFoodToLog = (foodData) => {
    // 解析热量值
    let calories = 0;
    
    if (typeof foodData.calories === 'number') {
      calories = foodData.calories;
    } else if (typeof foodData.calories === 'string') {
      const match = foodData.calories.match(/\d+/);
      calories = match ? parseInt(match[0], 10) : 0;
    }
    
    // 更新食物日志
    const newFoodLogs = [...foodLogs];
    const dayLogs = [...(newFoodLogs[activeDay] || [])];
    
    // 检查是否已存在相同的食物
    const existingIndex = dayLogs.findIndex(
      item => item.food_name === foodData.food_name && item.mealType === mealType
    );
    
    if (existingIndex >= 0) {
      // 更新现有食物项
      dayLogs[existingIndex] = {
        ...dayLogs[existingIndex],
        calories: dayLogs[existingIndex].calories + calories,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      // 添加新食物项
      dayLogs.push({
        ...foodData,
        calories,
        mealType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    
    newFoodLogs[activeDay] = dayLogs;
    
    // 更新每日总热量
    const newDailyCalories = [...dailyCalories];
    newDailyCalories[activeDay] = (newDailyCalories[activeDay] || 0) + calories;
    
    // 更新每餐热量
    const newMealCalories = [...mealCalories];
    const currentDayMeal = newMealCalories[activeDay] || { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    newMealCalories[activeDay] = {
      ...currentDayMeal,
      [mealType]: currentDayMeal[mealType] + calories
    };
    
    // 保存到持久化存储
    persistStore.setFoodLogs(user.id, newFoodLogs);
    persistStore.setDailyCalories(user.id, newDailyCalories);
    persistStore.setMealCalories(user.id, newMealCalories);
  };

  // 获取当前日期的计划
  const currentDayPlan = dietPlan?.plan?.[activeDay]?.diet || {};
  
  // 计算热量进度百分比
  const maxCalories = currentDayPlan['max-calorie'] || 2000;

  // 重新获取饮食计划
  const retryFetchDietPlan = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const plan = await getDietPlan({
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetweight,
        age: user.age,
        activityType: user.sportType,
        bodyType: user.bodyType
      });
      
      setDietPlan(plan);
      
      // 更新缓存
      persistStore.setDietPlan(user.id, {
        data: plan,
        timestamp: Date.now()
      });
    } catch (err) {
      let errorMsg = '获取饮食计划失败: ' + err.message;
      
      if (err.message.includes('网络错误')) {
        errorMsg += ' - 请检查您的网络连接';
      } else if (err.message.includes('服务器错误')) {
        errorMsg += ' - 请稍后再试';
      } else if (err.message.includes('无法连接到服务器')) {
        errorMsg += ' - 可能是API服务不可用';
      } else if (err.message.includes('CORS')) {
        errorMsg += ' - 跨域问题，请确保代理配置正确';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="diet-container">请先登录</div>;
  }

  return (
    <div className="diet-container">
      <div className="header">
        <h1 className="page-title">个性化饮食计划</h1>
        <div className="user-info">
          <span className="username">{user.username}</span>
          <div className="user-stats">
            <span>身高: {user.height}cm</span>
            <span>体重: {user.weight}kg</span>
            <span>目标: {user.targetweight}kg</span>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>正在生成您的个性化饮食计划...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <div>{error}</div>
          <button 
            className="retry-btn"
            onClick={retryFetchDietPlan}
          >
            重试
          </button>
        </div>
      )}
      
      {/* 日期选择器 */}
      <div className="day-selector">
        {dietPlan?.plan?.map((day, index) => {
          const maxCal = day.diet?.['max-calorie'] || 2000;
          const progress = Math.min(100, ((dailyCalories[index] || 0) / maxCal) * 100);
          
          return (
            <div 
              key={index}
              className={`day-card ${index === activeDay ? 'active' : ''}`}
              onClick={() => setActiveDay(index)}
            >
              <div className="day-name">{day.day}</div>
              <div className="day-calories">
                <span>{dailyCalories[index] || 0}</span>
                / {maxCal} 大卡
              </div>
              <div 
                className="calorie-progress" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          );
        })}
      </div>
      
      {/* 主要内容区域 */}
      {dietPlan && (
        <div className="diet-content">
          {/* 仪表盘区域 */}
          <div className="dashboard-section">
            <CalorieDashboard 
              currentCalories={dailyCalories[activeDay] || 0}
              maxCalories={maxCalories}
              mealCalories={mealCalories[activeDay] || { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 }}
            />
          </div>
          
          {/* 饮食计划详情 */}
          <div className="diet-plan-section">
            <div className="section-header">
              <h2>{dietPlan.plan[activeDay].day} 饮食计划</h2>
              <div className="max-calories">
                今日热量上限: {currentDayPlan['max-calorie'] || 2000} 大卡
              </div>
            </div>
            
            {/* 营养建议卡片 */}
            <div className="nutrition-cards">
              <div className="card">
                <div className="card-title">碳水摄入</div>
                <div className="card-value">{currentDayPlan['carbohydrate intake'] || '-'}</div>
              </div>
              <div className="card">
                <div className="card-title">蛋白质摄入</div>
                <div className="card-value">{currentDayPlan['protein intake'] || '-'}</div>
              </div>
              <div className="card">
                <div className="card-title">脂肪摄入</div>
                <div className="card-value">{currentDayPlan['fat intake'] || '-'}</div>
              </div>
              <div className="card">
                <div className="card-title">糖摄入</div>
                <div className="card-value">{currentDayPlan['sugar intake'] || '-'}</div>
              </div>
            </div>
            
            {/* 餐食建议 */}
            <div className="meal-suggestions">
              <div className="meal">
                <div className="meal-header">
                  <span className="meal-icon">🍳</span>
                  <h3>早餐</h3>
                </div>
                <p>{currentDayPlan['Breakfast suggestions'] || '无建议'}</p>
              </div>
              
              <div className="meal">
                <div className="meal-header">
                  <span className="meal-icon">🍲</span>
                  <h3>午餐</h3>
                </div>
                <p>{currentDayPlan['Lunch suggestions'] || '无建议'}</p>
              </div>
              
              <div className="meal">
                <div className="meal-header">
                  <span className="meal-icon">🍽️</span>
                  <h3>晚餐</h3>
                </div>
                <p>{currentDayPlan['Dinner suggestions'] || '无建议'}</p>
              </div>
            </div>
          </div>
          
          {/* 食物记录区域 */}
          <div className="food-log-section">
            <h2>记录今日饮食</h2>
            
            <div className="log-options">
              {/* 餐食类型选择 */}
              <div className="meal-type-selector">
                <label>选择餐食类型:</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="breakfast">早餐</option>
                  <option value="lunch">午餐</option>
                  <option value="dinner">晚餐</option>
                  <option value="snacks">零食</option>
                </select>
              </div>
              
              {/* 手动输入 */}
              <div className="manual-input">
                <input
                  type="text"
                  value={manualFood}
                  onChange={(e) => setManualFood(e.target.value)}
                  placeholder="输入食物描述 (例如: 一个中等大小的苹果)"
                  onKeyPress={(e) => e.key === 'Enter' && handleTextAnalysis()}
                />
                <button 
                  className="analyze-btn"
                  onClick={handleTextAnalysis}
                  disabled={!manualFood.trim()}
                >
                  分析热量
                </button>
              </div>
              
              {/* 图片识别 */}
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="upload-btn"
                  onClick={() => fileInputRef.current.click()}
                >
                  上传食物图片
                </button>
              </div>
            </div>
            
            {/* 食物日志 */}
            <div className="food-log">
              <h3>今日饮食记录</h3>
              
              {foodLogs[activeDay]?.length === 0 ? (
                <div className="empty-log">
                  <p>暂无饮食记录</p>
                  <p>添加食物开始跟踪您的热量摄入</p>
                </div>
              ) : (
                <div className="food-list">
                  <div className="list-header">
                    <span>食物</span>
                    <span>热量</span>
                    <span>时间</span>
                    <span>餐型</span>
                  </div>
                  
                  {foodLogs[activeDay]?.map((food, index) => (
                    <div key={index} className="food-item">
                      <div className="food-image-container">
                        {food.imageUrl ? (
                          <img src={food.imageUrl} alt={food.food_name} className="food-image" />
                        ) : food.imageData ? (
                          <img src={food.imageData} alt={food.food_name} className="food-image" />
                        ) : (
                          <div className="food-icon">🍽️</div>
                        )}
                        <span className="food-name">{food.food_name}</span>
                      </div>
                      <span className="food-calories">{food.calories} 大卡</span>
                      <span className="food-time">{food.timestamp}</span>
                      <span className="food-meal-type">
                        {food.mealType === 'breakfast' && '早餐'}
                        {food.mealType === 'lunch' && '午餐'}
                        {food.mealType === 'dinner' && '晚餐'}
                        {food.mealType === 'snacks' && '零食'}
                      </span>
                    </div>
                  ))}
                  
                  <div className="food-total">
                    <span>今日总计</span>
                    <span className="total-calories">{dailyCalories[activeDay] || 0} 大卡</span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!dietPlan && !loading && !error && (
        <div className="no-plan">
          <p>尚未生成饮食计划</p>
          <button 
            className="generate-btn"
            onClick={retryFetchDietPlan}
          >
            重新生成计划
          </button>
        </div>
      )}
    </div>
  );
};

export default Diet;