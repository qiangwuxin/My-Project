import { useUserStore } from '../../store/user';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './requireAuth.styl';

const RequireAuth = ({ children }) => {
  const { isLogin } = useUserStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  useEffect(() => {
    if (!isLogin) {
      navigate('/', { state: { from: pathname } });
    }
  }, [isLogin, navigate, pathname]);

  if (!isLogin) {
    return (
      <div className="auth-container">
        <div className="auth-icon">🔒</div>
        <h2 className="auth-title">需要登录</h2>
        <p className="auth-message">请登录以访问此页面</p>
        <div className="auth-actions">
          <button 
            className="auth-btn login-btn"
            onClick={() => navigate('/')}
          >
            <i>→</i> 前往登录
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;