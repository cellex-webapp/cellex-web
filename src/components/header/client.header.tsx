
import { useNav } from "../../utils/navigation";
import logo from "../../assets/logo/cellex.png";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";

const ClientHeader = () => {
    const { go } = useNav();
    return (
        <header className="w-full flex items-center px-8 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2 mr-8 cursor-pointer" onClick={() => go("/")}>
                <img src={logo} alt="Cellex Logo" className="h-16" />
                <span className="text-[20px] font-semibold text-primary-300 select-none">CELLEX</span>
            </div>
            <button
                className="flex items-center gap-2 bg-primary-300 text-white rounded-full px-5 py-2 font-medium text-[15px] ml-8 hover:bg-primary-400 transition-colors"
                type="button"
                onClick={() => go("/category")}
            >
                <MenuOutlined style={{ fontSize: 18 }} />
                Danh mục
            </button>
            <div className="flex-1 flex justify-center">
                <div className="flex items-center bg-primary-950 rounded-lg px-4 h-10 max-w-[600px] w-full">
                    <input
                        type="text"
                        placeholder="Tìm trong trang..."
                        className="flex-1 bg-transparent border-none outline-none text-[15px] text-primary-300 placeholder:text-primary-700"
                    />
                    <SearchOutlined style={{ color: '#70C4FF', fontSize: 18 }} />
                </div>
            </div>
            <button
                className="button-primary min-w-[100px] h-10 text-[15px] ml-8"
                type="button"
                onClick={() => go("/login")}
            >
                Đăng nhập
            </button>
        </header>
    );
};

export default ClientHeader;