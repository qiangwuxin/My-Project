import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../store/user';
import { usePersistStore } from '../../store/persist';
import { getSportPlan } from '../../api/ai/getSportPlan';
import { getDetail } from '../../api/ai/getDetail';
import { getPicFromText } from '../../api/ai/getPicFromText'; // 添加图片API
import './Workout.styl';

const Workout = () => {
  const { user } = useUserStore();
  const persistStore = usePersistStore();
  
  const [sportPlan, setSportPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('plan');
  
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseDetail, setExerciseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  
  // 新增状态：存储热门动作的图片URL
  const [exerciseThumbnails, setExerciseThumbnails] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchSportPlan = async () => {
      setLoading(true);
      setError('');
      try {
        // 检查缓存
        const cachedPlan = persistStore.sportPlans[user.id];
        const cachedCompleted = persistStore.completedExercises[user.id];
        const now = Date.now();
        
        // 使用缓存数据
        if (cachedPlan && now - cachedPlan.timestamp < 24 * 60 * 60 * 1000) {
          setSportPlan(cachedPlan.data);
          
          if (cachedCompleted) {
            setCompletedExercises(cachedCompleted);
          } else {
            const initialCompleted = cachedPlan.data.plan.map(day => 
              day.exercises.map(() => false)
            );
            setCompletedExercises(initialCompleted);
          }
          
          setLoading(false);
          return;
        }
        
        // 获取新计划
        const plan = await getSportPlan({
          height: user.height,
          weight: user.weight,
          targetWeight: user.targetweight,
          age: user.age,
          activityType: user.sportType,
          bodyType: user.bodyType
        });
        
        setSportPlan(plan);
        
        // 初始化完成状态
        const initialCompleted = plan.plan.map(day => 
          day.exercises.map(() => false)
        );
        setCompletedExercises(initialCompleted);
        
        // 保存到持久化存储
        persistStore.setSportPlan(user.id, {
          data: plan,
          timestamp: now
        });
        persistStore.setCompletedExercises(user.id, initialCompleted);
      } catch (err) {
        let errorMsg = '获取健身计划失败: ' + err.message;
        if (err.message.includes('JSON') || err.message.includes('格式')) {
          errorMsg = '计划生成格式错误，正在尝试重新生成...';
          setTimeout(() => {
            retryFetchSportPlan();
          }, 2000);
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchSportPlan();
  }, [user, persistStore]);

  // 新增：获取动作图片的函数
  const fetchExerciseThumbnails = async () => {
    const popularExercises = [
      "深蹲", "卧推", "硬拉", "引体向上", "俯卧撑", "平板支撑"
    ];
    
    const thumbnails = {};
    
    for (const exercise of popularExercises) {
      try {
        const url = await getPicFromText(exercise);
        thumbnails[exercise] = url;
      } catch (error) {
        console.error(`获取动作图片失败: ${exercise}`, error);
        thumbnails[exercise] = null;
      }
    }
    
    setExerciseThumbnails(thumbnails);
  };

  useEffect(() => {
    if (activeTab === 'exercises' && Object.keys(exerciseThumbnails).length === 0) {
      fetchExerciseThumbnails();
    }
  }, [activeTab]);

  const fetchExerciseDetail = async (exerciseName) => {
    setDetailLoading(true);
    setDetailError('');
    setDetailVisible(true);
    
    try {
      const detail = await getDetail(exerciseName);
      setExerciseDetail(detail);
    } catch (err) {
      setDetailError('获取动作详情失败: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailVisible(false);
    setCurrentExercise(null);
    setExerciseDetail(null);
  };

  // 更新完成状态时保存到持久化存储
  const toggleExerciseCompleted = (dayIndex, exerciseIndex) => {
    setCompletedExercises(prev => {
      const newCompleted = [...prev];
      newCompleted[dayIndex] = [...newCompleted[dayIndex]];
      newCompleted[dayIndex][exerciseIndex] = !newCompleted[dayIndex][exerciseIndex];
      
      // 保存到持久化存储
      if (user) {
        persistStore.setCompletedExercises(user.id, newCompleted);
      }
      
      return newCompleted;
    });
  };

  const calculateTotalCalories = (dayIndex) => {
    if (!sportPlan) return 0;
    return sportPlan.plan[dayIndex].exercises.reduce((total, exercise, index) => {
      if (completedExercises[dayIndex]?.[index]) {
        return total + (parseInt(exercise.calories) || 0);
      }
      return total;
    }, 0);
  };

  const currentDayPlan = sportPlan?.plan?.[activeDay] || { day: '', exercises: [] };

  const getDayName = (index) => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    return days[index];
  };

  const retryFetchSportPlan = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const plan = await getSportPlan({
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetweight,
        age: user.age,
        activityType: user.sportType,
        bodyType: user.bodyType
      });
      setSportPlan(plan);
      
      // 初始化完成状态
      const initialCompleted = plan.plan.map(day => 
        day.exercises.map(() => false)
      );
      setCompletedExercises(initialCompleted);
      
      // 保存到持久化存储
      persistStore.setSportPlan(user.id, {
        data: plan,
        timestamp: Date.now()
      });
      persistStore.setCompletedExercises(user.id, initialCompleted);
    } catch (err) {
      setError('获取健身计划失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const showExerciseDetail = (exercise) => {
    setCurrentExercise(exercise);
    setExerciseDetail(null);
    fetchExerciseDetail(exercise.name);
  };

  if (!user) {
    return <div className="workout-container">请先登录</div>;
  }

  return (
    <div className="workout-container">
      <div className="header">
        <h1 className="page-title">个性化健身计划</h1>
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
          <p>正在生成您的个性化健身计划...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <div>{error}</div>
          <button className="retry-btn" onClick={retryFetchSportPlan}>重试</button>
        </div>
      )}
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>训练计划</div>
        <div className={`tab ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>进度追踪</div>
        <div className={`tab ${activeTab === 'exercises' ? 'active' : ''}`} onClick={() => setActiveTab('exercises')}>动作库</div>
      </div>
      
      {activeTab === 'plan' && sportPlan && (
        <div className="workout-content">
          <div className="day-selector">
            {sportPlan.plan.map((day, index) => (
              <div key={index} className={`day-card ${index === activeDay ? 'active' : ''}`} onClick={() => setActiveDay(index)}>
                <div className="day-name">{day.day}</div>
                <div className="day-calories"><span>{calculateTotalCalories(index)}</span> 大卡</div>
              </div>
            ))}
          </div>
          
          <div className="workout-details">
            <div className="section-header">
              <h2>{sportPlan.plan[activeDay].day} 训练计划</h2>
              <div className="total-calories">今日消耗: {calculateTotalCalories(activeDay)} 大卡</div>
            </div>
            
            <div className="exercise-list">
              {currentDayPlan.exercises.map((exercise, index) => (
                <div key={index} className={`exercise-card ${completedExercises[activeDay]?.[index] ? 'completed' : ''}`}>
                  <div className="exercise-header">
                    <h3 className="exercise-name">{exercise.name}</h3>
                    <div className="exercise-calories">{exercise.calories} 大卡</div>
                  </div>
                  
                  <div className="exercise-details">
                    <div className="detail">
                      <span className="label">强度/重量:</span>
                      <span>{exercise.intensity}</span>
                    </div>
                    <div className="detail">
                      <span className="label">组数/次数:</span>
                      <span>{exercise.sets_reps}</span>
                    </div>
                    <div className="detail">
                      <span className="label">持续时间:</span>
                      <span>{exercise.duration}</span>
                    </div>
                  </div>
                  
                  <div className="exercise-actions">
                    <button className={`complete-btn ${completedExercises[activeDay]?.[index] ? 'completed' : ''}`}
                      onClick={() => toggleExerciseCompleted(activeDay, index)}>
                      {completedExercises[activeDay]?.[index] ? '✓ 已完成' : '标记完成'}
                    </button>
                    <button className="info-btn" onClick={() => showExerciseDetail(exercise)}>动作详情</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'progress' && sportPlan && (
        <div className="progress-content">
          <h2 className="section-title">本周训练进度</h2>
          
          <div className="progress-chart">
            <div className="chart-header">
              <span>训练日</span>
              <span>完成度</span>
              <span>消耗卡路里</span>
            </div>
            
            {sportPlan.plan.map((day, index) => {
              const completedCount = completedExercises[index]?.filter(Boolean).length || 0;
              const totalExercises = day.exercises.length;
              const progress = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
              
              return (
                <div key={index} className="progress-item">
                  <div className="day-name">{day.day}</div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                      <span className="progress-text">{progress}%</span>
                    </div>
                  </div>
                  <div className="calories">{calculateTotalCalories(index)} 大卡</div>
                </div>
              );
            })}
          </div>
          
          <div className="weekly-summary">
            <div className="summary-card">
              <div className="summary-value">{completedExercises.flat().filter(Boolean).length}</div>
              <div className="summary-label">完成动作</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {sportPlan.plan.reduce((total, _, index) => total + calculateTotalCalories(index), 0)}
              </div>
              <div className="summary-label">总消耗卡路里</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {Math.round(sportPlan.plan.reduce((total, _, index) => total + calculateTotalCalories(index), 0) / 7700)}
              </div>
              <div className="summary-label">减脂(千克)</div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'exercises' && (
        <div className="exercises-library">
          <h2 className="section-title">健身动作库</h2>
          <div className="exercise-categories">
            <div className="category-card">
              <div className="category-icon">🏋️‍♂️</div>
              <h3>力量训练</h3>
              <p>杠铃、哑铃等器械训练</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🏃‍♂️</div>
              <h3>有氧运动</h3>
              <p>跑步、跳绳等心肺训练</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🧘‍♀️</div>
              <h3>柔韧性训练</h3>
              <p>拉伸、瑜伽等柔韧性练习</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🤸‍♂️</div>
              <h3>功能性训练</h3>
              <p>增强日常活动能力</p>
            </div>
          </div>
          
          <div className="popular-exercises">
            <h3>热门动作</h3>
            <div className="exercise-grid">
              {[
                { name: "深蹲", calories: "200-300", muscles: "腿部, 臀部" },
                { name: "卧推", calories: "150-250", muscles: "胸部, 三头肌" },
                { name: "硬拉", calories: "250-350", muscles: "背部, 腿部" },
                { name: "引体向上", calories: "100-200", muscles: "背部, 二头肌" },
                { name: "俯卧撑", calories: "80-150", muscles: "胸部, 肩部" },
                { name: "平板支撑", calories: "50-100", muscles: "核心肌群" },
              ].map((exercise, index) => (
                <div key={index} className="exercise-item" onClick={() => showExerciseDetail(exercise)}>
                  {/* 添加实际图片显示 */}
                  <div className="exercise-thumb">
                    {exerciseThumbnails[exercise.name] ? (
                      <img 
                        src={exerciseThumbnails[exercise.name]} 
                        alt={exercise.name} 
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.parentNode.style.background = '#f0f4f8';
                        }}
                      />
                    ) : (
                      <div className="thumbnail-placeholder">图片加载中...</div>
                    )}
                  </div>
                  <div className="exercise-info">
                    <h4>{exercise.name}</h4>
                    <div className="exercise-meta">
                      <span>🔥 {exercise.calories} 大卡/30分钟</span>
                      <span>💪 {exercise.muscles}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {!sportPlan && !loading && !error && (
        <div className="no-plan">
          <p>尚未生成健身计划</p>
          <button className="generate-btn" onClick={retryFetchSportPlan}>重新生成计划</button>
        </div>
      )}
      
      {detailVisible && (
        <div className="detail-modal">
          <div className="modal-overlay" onClick={closeDetailModal}></div>
          
          <div className="modal-content">
            <button className="close-btn" onClick={closeDetailModal}>×</button>
            
            {detailLoading ? (
              <div className="detail-loading">
                <div className="loading-spinner"></div>
                <p>正在获取动作详情...</p>
              </div>
            ) : detailError ? (
              <div className="detail-error">
                <p>{detailError}</p>
                <button className="retry-btn" onClick={() => fetchExerciseDetail(currentExercise.name)}>重试</button>
              </div>
            ) : (
              exerciseDetail && (
                <div className="exercise-detail">
                  <div className="detail-header">
                    <h2 className="detail-title">{exerciseDetail.action_name}</h2>
                  </div>
                  
                  <div className="detail-meta">
                    <div className="meta-item">
                      <span className="meta-label">难度:</span>
                      <span className="meta-value">{exerciseDetail.difficulty}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">器械:</span>
                      <span className="meta-value">{exerciseDetail.equipment}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">目标肌群:</span>
                      <span className="meta-value">{exerciseDetail.muscles}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>动作描述</h3>
                    <p className="detail-description">{exerciseDetail.description}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>常见错误</h3>
                    <p>{exerciseDetail.common_mistakes}</p>
                  </div>
                  
                  <div className="detail-section">
                    <h3>安全提示</h3>
                    <p>{exerciseDetail.safety_tips}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;