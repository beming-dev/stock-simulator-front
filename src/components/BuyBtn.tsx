import { useAuth } from "../context/AuthContext";
import axiosWithToken from "../utils/customAxios";

interface BuyProps {
  stockSymbol: string;
  quantity: number;
  price: number;
}

const BuyBtn: React.FC<BuyProps> = ({ stockSymbol, quantity, price }) => {
  const { token } = useAuth();

  const handleBuy = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    await axiosWithToken(token).post("/stock/buy", {
      symbol: stockSymbol,
      amount: quantity,
      price,
    });
    alert(`Successfully bought ${quantity} shares of ${stockSymbol}`);
  };

  return (
    <button
      onClick={handleBuy}
      className="flex-1 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
    >
      Buy
    </button>
  );
};

export default BuyBtn;
