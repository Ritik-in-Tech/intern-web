import { API_BASE_URL } from "../../constant";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  client?: {
    id: number;
    email: string;
    name: string;
    facilityId: string;
  };
  authToken?: string;
  error?: string;
}

export const Clientlogin = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    return await response.json();
  } catch (error) {
    return { error: (error as Error).message };
  }
};
