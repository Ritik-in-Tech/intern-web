import axios from "axios";
import { API_BASE_URL } from "../../constant";

export interface ViewingHistoryData {
  contentId: number;
  trainingHistoryId: number;
}

export interface ViewingHistoryResponse {
  statusCode: number;
  message?: string;
  id?: number;
}

export const addViewingHistory = async (
  data: ViewingHistoryData,
  authToken: string
): Promise<ViewingHistoryResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/viewing-history/${data.trainingHistoryId}`,
      { contentId: data.contentId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return { statusCode: response.status, id: response.data.id };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        statusCode: error.response.status,
        message: error.response.data.error,
      };
    } else {
      return { statusCode: 500, message: "An unexpected error occurred" };
    }
  }
};

export interface ReportData {
  userId: number;
  data: {
    physical: number;
    emotional: number;
  };
}

export interface ReportResponse {
  statusCode: number;
  message?: string;
  id?: number;
}

export const createReport = async (
  data: ReportData,
  trainingHistoryId: number,
  authToken: string
): Promise<ReportResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/reports/${trainingHistoryId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return { statusCode: response.status, id: response.data.id };
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

export interface TrainingHistoryData {
  viewingHistoryIds?: number[];
  physicalConditionFormIds?: number[];
}

export const createTrainingHistory = async (
  data: TrainingHistoryData,
  authToken: string
) => {
  const response = await fetch(`${API_BASE_URL}/training-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export interface UpdateTrainingHistoryData {
  physicalConditionFormIds?: number[];
  viewingHistoryIds?: number[];
}

export const updateTrainingHistory = async (
  id: number,
  data: UpdateTrainingHistoryData,
  authToken: string
) => {
  const response = await fetch(`${API_BASE_URL}/training-history/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
