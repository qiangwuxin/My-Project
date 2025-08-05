import { Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/user';
import './navbar.styl';

const NavBar = () => {
  const { isLogin, user, logout } = useUserStore();
  const location = useLocation();
  
  // 定义导航项
  const navItems = [
    { path: '/diet', label: '饮食', icon: '🍽️' },
    { path: '/workout', label: '运动', icon: '💪' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <div className="navbar">
      <div className="nav-items">
        {isLogin ? (
          <>
            {navItems.map((item) => (
              <Link
                to={item.path}
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
            <div className="nav-item" onClick={logout}>
              <span className="nav-icon">👋</span>
              <span className="nav-label">退出</span>
            </div>
          </>
        ) : (
          <Link to="/" className="nav-item">
            <span className="nav-icon">🔑</span>
            <span className="nav-label">登录</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;