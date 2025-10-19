import React from 'react';
import OtpInput from 'react-otp-input';

interface OTPFormProps {
  otp: string;
  onChange: (otp: string) => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  loading: boolean;
}

const OTPForm: React.FC<OTPFormProps> = ({ otp, onChange, onSubmit, onResend, loading }) => {
  const isOtpValid = typeof otp === 'string' && /^\d{6}$/.test(otp);

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto">
      <div className="mb-4">
        <label htmlFor="otp-input" className="block text-center text-sm font-medium text-gray-700 mb-2">
          Mã xác thực (OTP)
        </label>
        <p className="text-center text-sm text-gray-500 mb-4">
          Chúng tôi đã gửi mã đến email hoặc số điện thoại của bạn.
        </p>

        <OtpInput
          value={otp}
          onChange={onChange}
          numInputs={6}
          renderSeparator={<span className="mx-1.5">-</span>}
          renderInput={(props) => <input {...props} />}
          containerStyle="flex justify-center"
          inputStyle={{
            width: '2.75rem',
            height: '3.25rem',
            fontSize: '1.25rem',
            borderRadius: '0.5rem',
            border: '1px solid #d1d5db',
            textAlign: 'center',
            margin: '0 0.2rem',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !isOtpValid}
        className="w-full px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
      >
        {loading ? 'Đang xác thực...' : 'Xác thực'}
      </button>

      <div className="mt-4 text-center text-sm">
        <span className="text-gray-600">Không nhận được mã? </span>
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="font-medium text-indigo-600 hover:text-indigo-500 disabled:text-indigo-300"
        >
          Gửi lại
        </button>
      </div>
    </form>
  );
};

export default OTPForm;