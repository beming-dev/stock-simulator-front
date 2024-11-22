import React, { useState } from "react";

interface Trade {
  symbol: string;
  quantity: number;
}

interface TradeFormProps {
  onTrade: (trade: Trade) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onTrade }) => {
  const [symbol, setSymbol] = useState<string>("");
  const [quantity, setQuantity] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol && quantity) {
      onTrade({ symbol, quantity: Number(quantity) });
      setSymbol("");
      setQuantity("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Stock Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
        required
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
      >
        Submit Trade
      </button>
    </form>
  );
};

export default TradeForm;
