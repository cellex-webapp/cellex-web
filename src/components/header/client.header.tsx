import logo from "../../assets/logo/cellex.png"; 
import { SearchOutlined, MenuOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";


const ClientHeader = () => {
  return (
    <header className="flex items-center px-4 py-2 bg-white border-b border-gray-200 gap-10">
      <div className="flex items-center">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-16" />
        </Link>
        <Link to="/" className="text-primary font-bold text-xl tracking-wide mr-4 text-primary-500 no-underline">
          CELLEX
        </Link>
      </div>

      <Link
        to="/categories"
        className="flex items-center gap-2 px-5 h-10 text-base font-semibold !rounded-full button-primary mr-6 no-underline"
      >
        <MenuOutlined className="text-lg" />
        Danh mục
      </Link>

      <div className="flex items-center flex-1 bg-primary-950 rounded-lg px-4 h-10 mr-6">
        <input
          type="text"
          placeholder="Tìm trong trang..."
          className="flex-1 bg-transparent border-none outline-none text-black text-[15px] placeholder:text-primary-300"
        />
        <SearchOutlined className="!text-primary-800 text-lg" />
      </div>

      <Link
        to="/login"
        className="px-5 h-10 text-base font-semibold rounded button-primary no-underline flex items-center justify-center"
      >
        Đăng nhập
      </Link>
    </header>
  );
};

export default ClientHeader;
