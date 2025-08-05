// src/pages/Settings/index.jsx
import { useState } from 'react';
import './settings.styl';
import { useUserStore } from '../../store/user';

const Settings = () => {
  const { user, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    notifications: true,
    darkMode: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里添加保存设置的逻辑
    alert('设置已保存');
  };

  return (
    <div className="settings-container">
      <div className="header">
        <h1>设置</h1>
        <p>管理您的账户偏好和隐私设置</p>
      </div>

      <div className="settings-content">
        <div className="sidebar">
          <div 
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <i className="icon-user"></i>
            <span>账户设置</span>
          </div>
          <div 
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <i className="icon-lock"></i>
            <span>安全</span>
          </div>
          <div 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="icon-settings"></i>
            <span>偏好设置</span>
          </div>
          <div 
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <i className="icon-shield"></i>
            <span>隐私</span>
          </div>
          <div className="tab logout" onClick={logout}>
            <i className="icon-logout"></i>
            <span>退出登录</span>
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'account' && (
            <div className="account-settings">
              <h2>账户信息</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>姓名</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入您的姓名"
                  />
                </div>
                
                <div className="form-group">
                  <label>电子邮箱</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="请输入您的邮箱"
                  />
                </div>
                
                <button type="submit" className="save-btn">
                  保存更改
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="security-settings">
              <h2>安全设置</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>当前密码</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="请输入当前密码"
                  />
                </div>
                
                <div className="form-group">
                  <label>新密码</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="请输入新密码"
                  />
                </div>
                
                <div className="form-group">
                  <label>确认新密码</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="请再次输入新密码"
                  />
                </div>
                
                <button type="submit" className="save-btn">
                  更新密码
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="preferences-settings">
              <h2>偏好设置</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                    />
                    接收通知
                  </label>
                  <p className="hint">开启后，您将收到系统通知和提醒</p>
                </div>
                
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="darkMode"
                      checked={formData.darkMode}
                      onChange={handleChange}
                    />
                    深色模式
                  </label>
                  <p className="hint">开启后，界面将切换为深色主题</p>
                </div>
                
                <button type="submit" className="save-btn">
                  保存偏好
                </button>
              </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-settings">
              <h2>隐私设置</h2>
              <div className="privacy-options">
                <div className="option">
                  <h3>数据共享</h3>
                  <p>允许匿名分享我的健康数据用于研究</p>
                  <div className="toggle-switch">
                    <input type="checkbox" id="data-sharing" />
                    <label htmlFor="data-sharing"></label>
                  </div>
                </div>
                
                <div className="option">
                  <h3>公开个人资料</h3>
                  <p>允许其他用户查看我的个人资料</p>
                  <div className="toggle-switch">
                    <input type="checkbox" id="public-profile" />
                    <label htmlFor="public-profile"></label>
                  </div>
                </div>
                
                <div className="option">
                  <h3>个性化广告</h3>
                  <p>根据我的兴趣显示相关广告</p>
                  <div className="toggle-switch">
                    <input type="checkbox" id="personalized-ads" />
                    <label htmlFor="personalized-ads"></label>
                  </div>
                </div>
              </div>
              
              <div className="data-section">
                <h3>数据管理</h3>
                <button className="data-btn">
                  <i className="icon-download"></i>
                  导出我的数据
                </button>
                <button className="data-btn delete">
                  <i className="icon-trash"></i>
                  删除我的账户
                </button>
                <p className="warning">
                  警告：删除账户将永久移除所有数据且无法恢复
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;