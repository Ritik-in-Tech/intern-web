import { API_BASE_URL } from "../../constant";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  admin?: {
    id: number;
    email: string;
    name: string;
  };
  authToken?: string;
  error?: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const url = `${API_BASE_URL}/admins/login`;
    console.log(url);
    const response = await fetch(url, {
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
