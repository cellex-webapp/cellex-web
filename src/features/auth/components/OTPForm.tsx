type Props = {
  otp: string;
  loading?: boolean;
  onChange: (v: string) => void;
  onResend?: () => void;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
};

const OTPForm: React.FC<Props> = ({ otp, loading = false, onChange, onResend, onSubmit }) => {
  return (
    <form className="w-full max-w-sm space-y-5" onSubmit={onSubmit}>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Mã xác thực (OTP)</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="^\d{6}$"
          maxLength={6}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-300/40 focus:border-indigo-500 transition tracking-widest text-center"
          value={otp}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Nhập 6 số"
          required
        />
        <div className="text-sm text-gray-600 mt-2">
          Chúng tôi đã gửi mã đến email hoặc số điện thoại của bạn.
        </div>
      </div>
      <button
        type="submit"
        className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-indigo-300/40 shadow"
        disabled={loading}
      >
        {loading ? 'Đang xác thực...' : 'Xác nhận'}
      </button>
      <div className="text-sm text-gray-600">
        Không nhận được mã?{' '}
        <button type="button" className="text-indigo-600 hover:underline" onClick={onResend}>
          Gửi lại
        </button>
      </div>
    </form>
  );
};

export default OTPForm;
