
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../../assets/logo/bg.jpg";

const OtpPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1200);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-primary-300/80 z-0" />
      <div className="w-full max-w-4xl bg-white rounded-xl flex flex-col md:flex-row overflow-hidden relative z-10">
        <div className="md:w-1/2 flex flex-col justify-center items-center bg-primary-300 p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 w-full text-left">Xác thực OTP</h2>
          <p className="text-white/90 text-base md:text-lg w-full text-left">
            Vui lòng nhập mã OTP đã gửi về email của bạn để hoàn tất.
          </p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12">
          <form className="w-full max-w-sm space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-primary-400 font-semibold mb-1">Mã OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-300 hover:bg-primary-400 text-white font-semibold py-2 rounded transition-colors duration-200 disabled:opacity-60 cursor-pointer"
              disabled={loading || otp.length < 4}
            >
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </button>
            <div className="flex justify-center mt-2">
              <button
                type="button"
                className="text-primary-400 hover:underline bg-transparent border-none p-0"
                onClick={() => alert('Đã gửi lại mã OTP!')}
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
