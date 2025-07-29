import { useEffect, useState } from "react";
import { StructuredDataType } from "../context/WebSocketContext";
import { StockData } from "../type/type";

interface VolumeProps {
  stockSymbol: string;
  stock: StockData;
  setStock: React.Dispatch<React.SetStateAction<StockData | null>>;
  currentSymbol: string;
  messages: any;
}

const StockVolume: React.FC<VolumeProps> = ({
  stockSymbol,
  stock,
  setStock,
  currentSymbol,
  messages,
}) => {
  const [realtimeData, setRealtimeData] = useState<StructuredDataType[]>([]);
  //parsing recieved data from websocket

  useEffect(() => {
    if (stock) {
      let symbolMessage;
      if (/^[A-Za-z]/.test(stockSymbol)) {
        symbolMessage = messages["DNAS" + stockSymbol];
      } else {
        symbolMessage = messages[stockSymbol];
      }
      if (!symbolMessage) return;
      setRealtimeData(symbolMessage);

      const lastMessage: StructuredDataType =
        symbolMessage[symbolMessage?.length - 1 || 0];

      const newStockData: StockData = {
        ...stock,
        price: parseFloat(parseFloat(lastMessage.currentPrice).toFixed(2)),
        high: parseFloat(parseFloat(lastMessage.high).toFixed(2)),
        low: parseFloat(parseFloat(lastMessage.low).toFixed(2)),
      };

      setStock(newStockData);
    }
  }, [messages]);

  return (
    <div className="mt-20">
      <h2 className="text-md sm:text-lg font-bold text-gray-700 mb-2">
        Trading Volume
      </h2>
      {/* Table for large screens */}
      <div className="hidden sm:block border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 text-left text-xs font-semibold text-gray-600">
                Time
              </th>
              <th className="p-2 text-right text-xs font-semibold text-gray-600">
                Price
              </th>
              <th className="p-2 text-right text-xs font-semibold text-gray-600">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {realtimeData.reverse().map((data, index) => {
              const formattedTime = `${data.time.slice(0, 2)}:${data.time.slice(
                2,
                4
              )}:${data.time.slice(4, 6)}`;
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-2 text-left text-xs text-gray-800">
                    {formattedTime}
                  </td>
                  <td className="p-2 text-right text-xs text-gray-800">
                    {currentSymbol}
                    {parseFloat(data.currentPrice).toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-xs text-gray-800">
                    {parseInt(data.volume, 10).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards for small screens */}
      <div className="sm:hidden grid gap-2 overflow-y-auto max-h-64">
        {realtimeData.reverse().map((data, index) => (
          <div
            key={index}
            className="bg-gray-50 p-2 rounded-lg shadow-sm border"
          >
            <p className="text-xs text-gray-500">Time: {data.time || ""}</p>
            <p className="text-xs text-gray-800 font-semibold">
              Price: {data.currentPrice || ""}
            </p>
            <p className="text-xs text-gray-800 font-semibold">
              Volume: {data.volume || ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockVolume;
