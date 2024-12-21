
import Logo from "../../assets/images/LogoColl.png";

const Loading = () => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 w-full h-full" style={{ zIndex: 9999 }}>
      <div className="bg-[#111] w-[550px] h-[600px] rounded-2xl shadow-2xl shadow-black/50 flex flex-col items-center justify-center space-y-6 p-6">
        {/* Custom logo */}
        <div className="w-[170px] h-[170px] animate-pulse">
          <img
            src={Logo}
            alt="Loading Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Spinner */}
        <div className="w-10 h-10 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin" />

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-gray-400 animate-pulse">Đang tải...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;