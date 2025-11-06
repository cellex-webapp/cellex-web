import { useState } from 'react';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

type Props = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  loading?: boolean;
  onFullNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onLoginLink?: () => void;
};

const SignupForm: React.FC<Props> = ({
  fullName,
  email,
  phoneNumber,
  password,
  confirmPassword,
  loading = false,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onLoginLink,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Họ và tên</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <UserOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="Nhập họ và tên"
            required
            autoComplete="name"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Email</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <MailOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Nhập email"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Số điện thoại</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <PhoneOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type="tel"
            inputMode="numeric"
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Nhập số điện thoại"
            required
            autoComplete="tel"
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
            placeholder="Tạo mật khẩu"
            required
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeInvisibleOutlined className="text-gray-500 text-lg" />
            ) : (
              <EyeOutlined className="text-gray-500 text-lg" />
            )}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Xác nhận mật khẩu</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <LockOutlined className="text-gray-400 text-lg" />
          </span>
          <input
            type={showConfirm ? 'text' : 'password'}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            required
            autoComplete="new-password"
            minLength={6}
          />
          <button
            type="button"
            aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
            onClick={() => setShowConfirm((v) => !v)}
          >
            {showConfirm ? (
              <EyeInvisibleOutlined className="text-gray-500 text-lg" />
            ) : (
              <EyeOutlined className="text-gray-500 text-lg" />
            )}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full cursor-pointer inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 !text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-300/40 shadow"
        disabled={loading}
      >
        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
      </button>
      <div className="text-sm text-gray-600 mt-4">
        Đã có tài khoản?{' '}
        <button type="button" className="!text-indigo-600 hover:underline" onClick={onLoginLink}>
          Đăng nhập
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
