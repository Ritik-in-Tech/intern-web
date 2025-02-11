import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchCompanies = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/companies`, {
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

export interface CompanyData {
  name: string;
  // nameKana: string;
  location: string;
  phoneNumber: string;
  // faxNumber: string;
  // personInChargeName: string;
  // personInChargeNameKana: string;
  adminId: number;
}

export const addCompany = async (
  data: CompanyData,
  authToken: string
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/companies`, data, {
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

export const fetchCompanyById = async (authToken: string, id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/companies/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
};

export const deleteCompany = async (
  authToken: string,
  id: Number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/companies/${id}`, {
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

export interface editCompanyData {
  name: string;
  // nameKana: string;
  location: string;
  phoneNumber: string;
  // faxNumber: string;
  // personInChargeName: string;
  // personInChargeNameKana: string;
}

export const editCompany = async (
  data: editCompanyData,
  authToken: string,
  id: number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/companies/${id}/edit`,
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
