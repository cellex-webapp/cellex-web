import { useState } from 'react';
import { MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

type Props = {
  email: string;
  password: string;
  loading?: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
  onGoogleSignIn?: () => void;
};

const LoginForm: React.FC<Props> = ({
  email,
  password,
  loading = false,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword,
  onSignup,
  onGoogleSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Email/Số điện thoại</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <MailOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Nhập email hoặc số điện thoại"
            required
            autoComplete="username"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <LockOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeInvisibleOutlined className="!text-gray-500 text-lg cursor-pointer" />
            ) : (
              <EyeOutlined className="!text-gray-500 text-lg cursor-pointer" />
            )}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 !bg-indigo-500 hover:!bg-indigo-700 active:bg-indigo-800 !text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-300/40 shadow cursor-pointer"
        disabled={loading}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-1 size-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        )}
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
      <div className="my-2 flex items-center">
        <hr className="flex-grow border-t border-gray-200" />
        <span className="mx-2 text-gray-500 text-sm">hoặc</span>
        <hr className="flex-grow border-t border-gray-200" />
      </div>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-150 hover:shadow focus:outline-none focus:ring-4 focus:ring-indigo-200/40 cursor-pointer"
        onClick={onGoogleSignIn}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_17_40)"><path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.3 8.5 30.2 9.7 32.4 11.7L38.1 6C34.4 2.6 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.1 45.8 20.5 45.6 19.7L44.5 20Z" fill="#FFC107"/><path d="M6.3 14.1L13.5 19.1C15.3 15.1 19.3 12.5 24 12.5C26.3 12.5 28.4 13.3 30.1 14.7L36.1 8.7C32.9 6 28.7 4.5 24 4.5C16.7 4.5 10.3 9.3 6.3 14.1Z" fill="#FF3D00"/><path d="M24 44.5C31.1 44.5 37.2 41.3 41.1 36.2L34.4 31.1C32.1 32.7 28.9 34.5 24 34.5C19.3 34.5 15.3 31.9 13.5 27.9L6.3 32.9C10.3 37.7 16.7 44.5 24 44.5Z" fill="#4CAF50"/><path d="M44.5 20H24V28.5H36.9C36.2 30.7 34.7 32.7 32.1 34.2L39.1 39.7C42.7 36.5 45.5 30.9 45.5 22.5C45.5 21.1 45.3 20.5 45.1 19.7L44.5 20Z" fill="#1976D2"/></g><defs><clipPath id="clip0_17_40"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>
        Đăng nhập với Google
      </button>
      <div className="flex justify-between items-center text-sm mt-2">
        <button
          type="button"
          className="!text-indigo-600 hover:!underline bg-transparent border-none p-0 cursor-pointer"
          onClick={onForgotPassword}
        >
          Quên mật khẩu?
        </button>
        <span className="text-gray-600">
          Bạn chưa có tài khoản?{' '}
          <button
            type="button"
            className="!text-indigo-600 hover:!underline bg-transparent border-none p-0 cursor-pointer"
            onClick={onSignup}
          >
            Đăng ký
          </button>
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
