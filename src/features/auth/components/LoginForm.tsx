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
