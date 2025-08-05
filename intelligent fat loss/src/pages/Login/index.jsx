import { useRef, useState } from 'react';
import { useUserStore } from '../../store/user';
import { useNavigate } from 'react-router-dom';
import './login.styl';

const Login = () => {
  const navigate = useNavigate();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const ageRef = useRef();
  const heightRef = useRef();
  const weightRef = useRef();
  const targetweightRef = useRef();
  const [bodyType, setBodyType] = useState('梨形');
  const [sportType, setSportType] = useState('久坐不动');
  const [error, setError] = useState('');
  const { login } = useUserStore();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    const age = ageRef.current.value;
    const height = heightRef.current.value;
    const weight = weightRef.current.value;
    const targetweight = targetweightRef.current.value;
    
    // 验证输入
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    try {
      // 调用登录函数并传递所有用户数据
      await login({
        username,
        password,
        age,
        height,
        weight,
        targetweight,
        bodyType,
        sportType,
      }); 
      
      // 登录成功后跳转
      navigate('/diet');
    } catch (err) {
      setError('登录失败: ' + (err.message || '用户名或密码错误'));
      console.error('登录错误:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="logo">
          <h1>健康管理</h1>
        </div>
        <div className="slogan">
          个性化饮食与运动计划，助您达成健康目标
        </div>
        <div className="features">
          <div className="feature">
            <div className="icon">🍎</div>
            <h3>智能饮食规划</h3>
            <p>根据您的身体数据定制专属饮食方案</p>
          </div>
          <div className="feature">
            <div className="icon">💪</div>
            <h3>科学运动指导</h3>
            <p>个性化健身计划，专业动作指导</p>
          </div>
          <div className="feature">
            <div className="icon">📊</div>
            <h3>数据追踪分析</h3>
            <p>记录每日摄入，可视化进度报告</p>
          </div>
          <div className="feature">
            <div className="icon">🎯</div>
            <h3>目标达成系统</h3>
            <p>设定目标，实时追踪，成就健康生活</p>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form">
          <h2>用户登录</h2>
          <p className="subtitle">请输入您的个人信息</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>用户名</label>
              <div className="input-with-icon">
                <i>👤</i>
                <input 
                  ref={usernameRef} 
                  type="text" 
                  placeholder="请输入用户名"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>密码</label>
              <div className="input-with-icon">
                <i>🔒</i>
                <input
                  ref={passwordRef} 
                  type="password" 
                  placeholder="请输入密码"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>年龄</label>
              <input
                ref={ageRef} 
                type="number" 
                placeholder="请输入年龄"
                required
                min="1"
                max="120"
              />
            </div>
            
            <div className="form-group">
              <label>身高(cm)</label>
              <input
                ref={heightRef} 
                type="number" 
                placeholder="请输入身高"
                required
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>体重(kg)</label>
              <input
                ref={weightRef} 
                type="number" 
                placeholder="请输入体重"
                required
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>目标体重(kg)</label>
              <input
                ref={targetweightRef} 
                type="number"
                placeholder="请输入目标体重"
                required
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>体型选择</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="bodyType"
                    value="梨形"
                    checked={bodyType === '梨形'}
                    onChange={() => setBodyType('梨形')}
                  />
                  梨形
                </label>
                <label>
                  <input
                    type="radio"
                    name="bodyType"
                    value="苹果型"
                    checked={bodyType === '苹果型'}
                    onChange={() => setBodyType('苹果型')}
                  />
                  苹果型
                </label>
                <label>
                  <input
                    type="radio"
                    name="bodyType"
                    value="匀称型"
                    checked={bodyType === '匀称型'}
                    onChange={() => setBodyType('匀称型')}
                  />
                  匀称型
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>运动方式</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="sportType"
                    value="久坐不动"
                    checked={sportType === '久坐不动'}
                    onChange={() => setSportType('久坐不动')}
                  />
                  久坐不动
                </label>
                <label>
                  <input
                    type="radio"
                    name="sportType"
                    value="有氧运动"
                    checked={sportType === '有氧运动'}
                    onChange={() => setSportType('有氧运动')}
                  />
                  有氧运动
                </label>
                <label>
                  <input
                    type="radio"
                    name="sportType"
                    value="无氧运动"
                    checked={sportType === '无氧运动'}
                    onChange={() => setSportType('无氧运动')}
                  />
                  无氧运动
                </label>
                <label>
                  <input
                    type="radio"
                    name="sportType"
                    value="有氧和无氧结合"
                    checked={sportType === '有氧和无氧结合'}
                    onChange={() => setSportType('有氧和无氧结合')}
                  />
                  有氧和无氧结合
                </label>
              </div>
            </div>
            
            <button type="submit" className="login-btn">
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;