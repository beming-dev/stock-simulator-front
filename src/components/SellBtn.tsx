import { useAuth } from "../context/AuthContext";
import axiosWithToken from "../utils/customAxios";

interface SellProps {
  stockSymbol: string;
  quantity: number;
}

const SellBtn: React.FC<SellProps> = ({ stockSymbol, quantity }) => {
  const { token } = useAuth();

  const handleSell = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    await axiosWithToken(token).post("/stock/sell", {
      symbol: stockSymbol,
      amount: quantity,
    });
    alert(`Successfully sold ${quantity} shares of ${stockSymbol}`);
  };

  return (
    <button
      onClick={handleSell}
      className="flex-1 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
    >
      Sell
    </button>
  );
};

export default SellBtn;
