import React, { useEffect } from 'react';
import MainDashboard from './smart_ui/MainDashboard';
import { useAuthStore } from './store/authStore';
import { loginApi, getCurrentUserApi } from './api/auth';

export const App: React.FC = () => {
  const { token, setAuth } = useAuthStore();

  useEffect(() => {
    const checkAuthAndLogin = async () => {
      try {
        if (token) {
          await getCurrentUserApi();
        } else {
          throw new Error('No token');
        }
      } catch (err) {
        try {
          const data = await loginApi('admin@productionai.com', 'Admin@123!');
          setAuth(data.user, data.access_token, data.refresh_token);
        } catch (loginErr) {
          console.error('Background login failed:', loginErr);
        }
      }
    };

    checkAuthAndLogin();
  }, [token, setAuth]);

  return <MainDashboard />;
};

export default App;
