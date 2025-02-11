import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchManagers = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/managers`, {
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

export interface ManagerData {
  name: string;
  password: string;
  email: string;
  facilityId: number;
  role: string;
}

export const addManager = async (
  data: ManagerData,
  authToken: string
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/managers`, data, {
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

export const fetchManagerById = async (authToken: string, id: number) => {
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

export interface editManagerData {
  facilityId: number;
  name: string;
  email: string;
  password: string;
}

export const editManager = async (
  data: editManagerData,
  authToken: string,
  id: number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/managers/${id}/edit`,
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

export const deleteManager = async (
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

export const fetchManagerByFacilityId = async (
  authToken: string,
  id: number
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/managers/facility/${id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};
