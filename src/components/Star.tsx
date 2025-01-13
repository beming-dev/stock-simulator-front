import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaRegStar, FaStar } from "react-icons/fa";
import axiosWithToken from "../utils/customAxios";

interface StarProps {
  stockSymbol: string;
}

const Star: React.FC<StarProps> = ({ stockSymbol }) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false); // 즐겨찾기 상태
  const { token } = useAuth();

  //   useEffect(() => {
  //     axios
  //       .get(`${import.meta.env.VITE_BACK_BASE_URL}/stock/like`)
  //       .then(({ data }) => setIsFavorite(data));
  //   }, []);

  const toggleFavorite = () => {
    if (!token) {
      console.log("no token");
      return;
    }
    axiosWithToken(token)
      .post("/stock/like", {
        symbol: stockSymbol,
      })
      .then(() => alert("success"))
      .catch(() => alert("fail"));

    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      onClick={toggleFavorite}
      className="cursor-pointer text-yellow-500 text-2xl sm:text-3xl ml-4"
    >
      {isFavorite ? <FaStar /> : <FaRegStar />}
    </div>
  );
};

export default Star;
