import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSignup = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      // TODO: call signup API then send OTP to phone/email
      await new Promise((res) => setTimeout(res, 800));
      // Persist the pending signup info for OTP page
      const pending = { fullName, email, phoneNumber, password };
      localStorage.setItem('pendingSignup', JSON.stringify(pending));
      navigate('/otp');
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-4xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Tạo tài khoản</h2>
          <p className="text-white/90 text-base md:text-lg">Đăng ký để bắt đầu sử dụng Cellex.</p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12 bg-white">
          <SignupForm
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            password={password}
            confirmPassword={confirmPassword}
            loading={loading}
            onFullNameChange={setFullName}
            onEmailChange={setEmail}
            onPhoneChange={setPhoneNumber}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={onSignup}
            onLoginLink={() => navigate('/login')}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
