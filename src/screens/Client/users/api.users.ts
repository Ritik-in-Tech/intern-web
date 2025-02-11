import axios, { AxiosResponse } from "axios";
import { API_BASE_URL } from "../../constant";

export const fetchUsers = async (authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
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

export interface UserData {
  name: string;
  gender: string;
  dateOfBirth: string;
  medicalRecordId: string;
  functionalLevel: string;
  medicalHistory: string;
}

export const addUser = async (
  data: UserData,
  authToken: string
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, data, {
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

export const fetchUserById = async (authToken: string, id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export interface editUserData {
  name: string;
  gender: string;
  dateOfBirth: string;
  medicalRecordId: string;
  functionalLevel: string;
  medicalHistory: string;
}

export const editUser = async (
  data: editUserData,
  authToken: string,
  id: number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${id}/edit`, data, {
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

export const deleteUser = async (
  authToken: string,
  id: Number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`, {
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

interface UploadUsersResponse {
  message: string;
  users: {
    name: string;
    gender: string;
    dateOfBirth: string;
    medicalRecordId: string | null;
    functionalLevel: string | null;
    medicalHistory: string | null;
  }[];
}

export const uploadUsers = async (
  file: File,
  authToken: string
): Promise<UploadUsersResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response: AxiosResponse<UploadUsersResponse> = await axios.post(
      `${API_BASE_URL}/users/user-csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data.details[0] || "Failed to upload users",
      });
    } else {
      return Promise.reject({
        status: 500,
        message: "Unexpected error occurred while uploading users",
      });
    }
  }
};
