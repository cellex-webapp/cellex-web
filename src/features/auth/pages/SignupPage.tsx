import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAuth } from '@/hooks/useAuth'; 
import SignupForm from '../components/SignupForm';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const { sendSignupCode, isLoading, error } = useAuth();

  const onSignup = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    const payload: ISendSignupCodePayload = {
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
    };

    try {
      const actionResult = await sendSignupCode(payload);
      
      unwrapResult(actionResult);

      const pending = { fullName, email, phoneNumber, password };
      localStorage.setItem('pendingSignup', JSON.stringify(pending));
      navigate('/otp');

    } catch (rejectedValue) {
      console.error('Failed to send sign-up code:', rejectedValue);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-4xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-start md:justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Tạo tài khoản</h2>
          <p className="text-white/90 text-base md:text-lg">Đăng ký để bắt đầu sử dụng dịch vụ.</p>
        </div>
      <div className="md:w-1/2 w-full flex flex-col justify-start md:justify-center items-center p-8 md:p-12 bg-white mt-6 md:mt-0">
          <SignupForm
            fullName={fullName}
            email={email}
            phoneNumber={phoneNumber}
            password={password}
            confirmPassword={confirmPassword}
            loading={isLoading}
            onFullNameChange={setFullName}
            onEmailChange={setEmail}
            onPhoneChange={setPhoneNumber}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={onSignup}
            onLoginLink={() => navigate('/login')}
          />
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;