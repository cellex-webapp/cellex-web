import logo from "../../assets/logo/cellex.png";
import { SearchOutlined, MenuOutlined, MessageFilled, BellFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const ClientHeader = () => {
  return (
  <header className="w-full flex items-center px-2 md:px-8 py-2 md:py-3 bg-white border-b border-gray-200 gap-2 md:gap-6 lg:gap-10">
      <div className="flex items-center min-w-fit">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-8 md:h-12 lg:h-10" />
        </Link>
        <span className="text-primary font-bold ml-1 md:ml-2 text-base md:text-xl tracking-wide text-primary-500 hidden sm:inline">
          CELLEX
        </span>
      </div>

      <Link
        to="/categories"
        className="flex items-center gap-1 md:gap-2 px-3 md:px-6 h-8 md:h-10 text-xs md:text-base font-semibold !rounded-full button-primary !bg-primary-500 no-underline min-w-fit"
      >
        <MenuOutlined className="text-base md:text-lg" />
        <span className="hidden sm:inline">Danh mục</span>
      </Link>

  <div className="hidden sm:flex items-center flex-1 max-w-[200px] md:max-w-[500px] ml-2 md:ml-20 bg-primary-950 rounded-lg px-2 md:px-5 h-8 md:h-10">
        <input
          type="text"
          placeholder="Tìm trong trang..."
          className="flex-1 bg-transparent border-none outline-none text-black text-xs md:text-[15px] placeholder:text-primary-300 px-1"
        />
        <SearchOutlined className="!text-primary-800 text-base md:text-lg ml-1 md:ml-2" />
      </div>

      <div className="flex items-center gap-1 md:gap-3 ml-1 md:ml-2">
        <button className="button-icon-round" title="Tin nhắn">
          <MessageFilled />
        </button>
        <button className="button-icon-round" title="Thông báo">
          <BellFilled />
        </button>
        <button className="button-icon-round hidden sm:flex" title="Tài khoản">
          <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.657-10 5v3h20v-3c0-3.343-6.686-5-10-5z"/>
          </svg>
        </button>
        <button className="button-icon-round hidden sm:flex" title="Giỏ hàng">
          <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
            <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm1.83-3.41l1.72-7.45A1 1 0 0 0 19.57 6H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A1.992 1.992 0 0 0 5 17c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ClientHeader;
