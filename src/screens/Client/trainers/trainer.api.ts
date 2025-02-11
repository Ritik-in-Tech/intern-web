import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchTrainers = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/trainers`, {
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

export interface TrainerData {
  name: string;
  password: string;
  email: string;
  role: string;
}

export const addTrainer = async (
  data: TrainerData,
  authToken: string
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/trainers`, data, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return { statusCode: response.status };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        statusCode: error.response.status,
        message: error.response.data.message,
      };
    } else {
      return { statusCode: 500, message: "An unexpected error occurred" };
    }
  }
};

export const fetchTrainerById = async (authToken: string, id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/managers/${id}`, {
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

export interface editTrainerData {
  name: string;
  email: string;
  password: string;
}

export const editTrainer = async (
  data: editTrainerData,
  authToken: string,
  id: number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/trainers/${id}/edit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return { statusCode: response.status };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        statusCode: error.response.status,
        message: error.response.data.message,
      };
    } else {
      return { statusCode: 500, message: "An unexpected error occurred" };
    }
  }
};

export const deleteTrainer = async (
  authToken: string,
  id: Number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/managers/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return { statusCode: response.status };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        statusCode: error.response.status,
        message: error.response.data.message,
      };
    } else {
      return { statusCode: 500, message: "An unexpected error occurred" };
    }
  }
};
