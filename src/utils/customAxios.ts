import axios from "axios";
import { useAuth } from "../context/AuthContext";

const { token } = useAuth();

const axiosWithToken = axios.create({
  baseURL: import.meta.env.VITE_BACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true,
});

export default axiosWithToken;
