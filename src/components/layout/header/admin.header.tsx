import logo from "../../../assets/logo/cellex.png";
import { MessageFilled, BellFilled } from "@ant-design/icons";
import { Link } from "react-router-dom";

const AdminHeader = () => {
  return (
  <header className="w-full flex items-center justify-between px-2 md:px-8 py-2 md:py-3 bg-white border-b border-gray-200">
    <div className="flex items-center min-w-fit">
      <Link to="/">
        <img src={logo} alt="Logo" className="h-8 md:h-12 lg:h-10" />
      </Link>
      <span className="text-primary font-bold ml-1 md:ml-2 text-base md:text-xl tracking-wide text-primary-500 hidden sm:inline">
        CELLEX
      </span>
    </div>
    <div className="flex items-center gap-1 md:gap-3 ml-1 md:ml-2">
      <button className="button-icon-round" title="Tin nhắn">
        <MessageFilled />
      </button>
      <button className="button-icon-round" title="Thông báo">
        <BellFilled />
      </button>
    </div>
  </header>
  );
};

export default AdminHeader;
