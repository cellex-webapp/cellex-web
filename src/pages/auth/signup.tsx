
import { useState } from "react";
import { signUp } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "../../components/context/app.context";
import bg from "../../assets/logo/bg.jpg";
import { EyeInvisibleOutlined, EyeTwoTone, GoogleCircleFilled } from "@ant-design/icons";

const SignupPage = () => {
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setIsAuthenticated, setUser } = useCurrentApp();

    const onSignup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // Giả lập role dựa vào phone
            let role: "admin" | "client" | "vendor" = "client";
            if (phone === "admin") role = "admin";
            else if (phone === "vendor") role = "vendor";
            const user = await signUp(role, phone);
            setUser(user);
            setIsAuthenticated(true);
            navigate('/otp');
        } finally {
            setLoading(false);
        }
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
                {/* Cột trái: mô tả */}
                <div className="md:w-1/2 flex flex-col justify-center items-center bg-primary-300 p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 w-full text-left">Đăng ký</h2>
                    <p className="text-white/90 text-base md:text-lg w-full text-left">
                        Vui lòng nhập đầy đủ thông tin số điện thoại, email và mật khẩu!
                    </p>
                </div>
                {/* Cột phải: form đăng ký */}
                <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12">
                    <form className="w-full max-w-sm space-y-5" onSubmit={onSignup}>
                        <div>
                            <label className="block text-primary-400 font-semibold mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-primary-400 font-semibold mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Nhập email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-primary-400 font-semibold mb-1">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-4 py-2 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-400 pr-10"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-400"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                >
                                    {showPassword ? <EyeInvisibleOutlined /> : <EyeTwoTone twoToneColor="#1B82E5" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary-300 hover:bg-primary-400 text-white font-semibold py-2 rounded transition-colors duration-200 disabled:opacity-60 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Đang đăng ký..." : "Đăng ký"}
                        </button>
                        <div className="my-2 flex items-center">
                            <hr className="flex-grow border-t border-gray-300" />
                            <span className="mx-2 text-gray-500">hoặc</span>
                            <hr className="flex-grow border-t border-gray-300" />
                        </div>
                        <button
                            type="button"
                            className="w-full flex items-center justify-center gap-2 border border-primary-300 text-primary-400 font-semibold py-2 rounded hover:bg-primary-50 transition-colors duration-200 hover:shadow cursor-pointer"
                            onClick={() => alert('Tính năng Google chưa khả dụng')}
                        >
                            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_17_40)"><path d="M44.5 20H24V28.5H36.9C35.5 33.1 31.2 36.5 24 36.5C16.3 36.5 10 30.2 10 22.5C10 14.8 16.3 8.5 24 8.5C27.3 8.5 30.2 9.7 32.4 11.7L38.1 6C34.4 2.6 29.5 0.5 24 0.5C11.8 0.5 2 10.3 2 22.5C2 34.7 11.8 44.5 24 44.5C36.2 44.5 46 34.7 46 22.5C46 21.1 45.8 20.5 45.6 19.7L44.5 20Z" fill="#FFC107"/><path d="M6.3 14.1L13.5 19.1C15.3 15.1 19.3 12.5 24 12.5C26.3 12.5 28.4 13.3 30.1 14.7L36.1 8.7C32.9 6 28.7 4.5 24 4.5C16.7 4.5 10.3 9.3 6.3 14.1Z" fill="#FF3D00"/><path d="M24 44.5C31.1 44.5 37.2 41.3 41.1 36.2L34.4 31.1C32.1 32.7 28.9 34.5 24 34.5C19.3 34.5 15.3 31.9 13.5 27.9L6.3 32.9C10.3 37.7 16.7 44.5 24 44.5Z" fill="#4CAF50"/><path d="M44.5 20H24V28.5H36.9C36.2 30.7 34.7 32.7 32.1 34.2L39.1 39.7C42.7 36.5 45.5 30.9 45.5 22.5C45.5 21.1 45.3 20.5 45.1 19.7L44.5 20Z" fill="#1976D2"/></g><defs><clipPath id="clip0_17_40"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>
                                Đăng ký với Google
                        </button>
                        <div className="flex justify-center items-center text-sm mt-2">
                            <span>
                                Bạn đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    className="text-primary-400 hover:underline bg-transparent border-none p-0"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </button>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;