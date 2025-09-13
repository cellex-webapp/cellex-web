import logo from "../../assets/logo/cellex.png"; 
import { SearchOutlined, MenuOutlined, LoginOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";


const ClientHeader = () => {
  return (
    <header className="w-full flex items-center px-4 md:px-8 py-3 bg-white border-b border-gray-200 gap-4 md:gap-6 lg:gap-10">
      <div className="flex items-center min-w-fit">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-10 md:h-14 lg:h-16" />
        </Link>
        <span className="text-primary font-bold text-lg md:text-xl tracking-wide text-primary-500 hidden sm:inline">
          CELLEX
        </span>
      </div>

      <Link
        to="/categories"
        className="flex items-center gap-1 md:gap-2 px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold !rounded-full button-primary !bg-primary-500 no-underline min-w-fit"
      >
        <MenuOutlined className="text-base md:text-lg" />
        <span className="hidden sm:inline">Danh mục</span>
      </Link>

      <div className="hidden sm:flex items-center flex-1 max-w-[500px] md:max-w-[500px] ml-20 bg-primary-950 rounded-lg px-3 md:px-5 h-9 md:h-10">
        <input
          type="text"
          placeholder="Tìm trong trang..."
          className="flex-1 bg-transparent border-none outline-none text-black text-[14px] md:text-[15px] placeholder:text-primary-300 px-1"
        />
        <SearchOutlined className="!text-primary-800 text-base md:text-lg ml-2" />
      </div>

      <Link
        to="/login"
        className="px-4 md:px-6 h-9 md:h-10 text-sm md:text-base font-semibold rounded button-primary no-underline flex items-center justify-center min-w-[40px] ml-auto"
        title="Đăng nhập"
      >
        <span className="hidden md:inline">Đăng nhập</span>
      </Link>
    </header>
  );
};

export default ClientHeader;
