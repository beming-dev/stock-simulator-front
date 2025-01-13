import axios from "axios";

// 매개변수로 토큰을 받아 Axios 인스턴스를 반환
const axiosWithToken = (token?: string) => {
  return axios.create({
    baseURL: import.meta.env.VITE_BACK_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
  });
};

export default axiosWithToken;
