import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchFacilities = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/facilities`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};

export interface FacilityData {
  name: string;
  location: string;
  phoneNumber: string;
  companyId: number;
}

export const addFacility = async (
  data: FacilityData,
  authToken: string
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/facilities`, data, {
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

export const fetchFacilityById = async (authToken: string, id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/facilities/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    // console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};

export const fetchFacilityByCompanyId = async (
  authToken: string,
  id: number
) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/facilities/company/${id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching facilities:", error);
    throw error;
  }
};

export interface editFacilityData {
  name: string;
  location: string;
  phoneNumber: string;
}

export const editFacility = async (
  data: editFacilityData,
  authToken: string,
  id: number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/facilities/${id}/edit`,
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

export const deleteFacilty = async (
  authToken: string,
  id: Number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/facilities/${id}`, {
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
