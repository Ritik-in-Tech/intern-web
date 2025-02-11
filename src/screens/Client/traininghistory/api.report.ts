import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchReports = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/training-history`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};

export const fetchUserReports = async (authToken: string, id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/training-history/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};
