import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
  const { user } = await login({ email, password });
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') navigate('/admin');
  else if (role === 'vendor') navigate('/vendor');
  else navigate('/client');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-4xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Đăng nhập</h2>
          <p className="text-white/90 text-base md:text-lg">
            Vui lòng nhập đầy đủ thông tin số điện thoại và mật khẩu!
          </p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12 bg-white">
          <LoginForm
            email={email}
            password={password}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onLogin}
            onForgotPassword={() => navigate('/forgot-password')}
            onSignup={() => navigate('/signup')}
            onGoogleSignIn={() => alert('Tính năng Google chưa khả dụng')}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

