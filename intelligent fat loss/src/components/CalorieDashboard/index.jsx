import React from 'react';
import './CalorieDashboard.styl';

const CalorieDashboard = ({ currentCalories, maxCalories, mealCalories }) => {
  // 计算进度百分比
  const progressPercentage = Math.min(100, (currentCalories / maxCalories) * 100);
  
  // 确定进度条颜色
  let progressColor;
  if (progressPercentage < 50) {
    progressColor = '#4CAF50'; // 绿色
  } else if (progressPercentage < 75) {
    progressColor = '#FFC107'; // 黄色
  } else if (progressPercentage < 90) {
    progressColor = '#FF9800'; // 橙色
  } else {
    progressColor = '#F44336'; // 红色
  }

  // 餐食数据
  const mealData = [
    { name: '早餐', value: mealCalories.breakfast, color: '#FF9F1C' },
    { name: '午餐', value: mealCalories.lunch, color: '#2EC4B6' },
    { name: '晚餐', value: mealCalories.dinner, color: '#E71D36' },
    { name: '零食', value: mealCalories.snacks, color: '#9B5DE5' }
  ];

  // 计算最大餐食值用于比例
  const maxMealValue = Math.max(...mealData.map(meal => meal.value), 1);

  return (
    <div className="calorie-dashboard">
      <div className="dashboard-header">
        <h3>今日热量摄入</h3>
        <div className="calorie-summary">
          <span className="current-calories">{currentCalories}</span>
          <span className="divider">/</span>
          <span className="max-calories">{maxCalories}</span>
          <span className="unit">大卡</span>
        </div>
      </div>
      
      {/* 总热量进度条 */}
      <div className="total-progress">
        <div 
          className="progress-bar"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: progressColor
          }}
        ></div>
        <div className="progress-labels">
          <span>0</span>
          <span>{maxCalories}</span>
        </div>
      </div>
      
      {/* 餐食分布 */}
      <div className="meal-distribution">
        <h4>餐食热量分布</h4>
        <div className="meal-bars">
          {mealData.map((meal, index) => (
            <div key={index} className="meal-bar">
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{
                    height: `${(meal.value / maxMealValue) * 100}%`,
                    backgroundColor: meal.color
                  }}
                ></div>
              </div>
              <div className="bar-label">
                <div className="meal-name">{meal.name}</div>
                <div className="meal-calories">{meal.value}大卡</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 热量状态指示器 */}
      <div className="calorie-status">
        <div className="status-item">
          <div className="status-indicator" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>正常</span>
        </div>
        <div className="status-item">
          <div className="status-indicator" style={{ backgroundColor: '#FFC107' }}></div>
          <span>接近上限</span>
        </div>
        <div className="status-item">
          <div className="status-indicator" style={{ backgroundColor: '#F44336' }}></div>
          <span>超出上限</span>
        </div>
      </div>
    </div>
  );
};

export default CalorieDashboard;