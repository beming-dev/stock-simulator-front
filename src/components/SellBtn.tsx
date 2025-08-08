import { useAuth } from "../context/AuthContext";
import { Holding } from "../type/type";
import axiosWithToken from "../utils/customAxios";

interface SellProps {
  stockSymbol: string;
  quantity: number;
  price: number;
  maximum: number;
  setHolding: (holding: Holding | null) => void;
}

const SellBtn: React.FC<SellProps> = ({
  stockSymbol,
  quantity,
  price,
  maximum,
  setHolding,
}) => {
  const { token } = useAuth();

  const handleSell = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }

    if (quantity > maximum) {
      alert(`You cannot sell more than your holding: ${maximum}`);
      return;
    }

    const { data } = await axiosWithToken(token).post("/stock/sell", {
      symbol: stockSymbol,
      amount: quantity,
      price,
    });
    setHolding(data);
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
