import { API_BASE_URL } from "../constant";
export interface ClientProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  facility: {
    id: number;
  };
}
export interface ClientProfileResponse {
  client: ClientProfile;
  statusCode: number;
  error?: string;
}

export const fetchClientProfile = async (
  clientauthToken: string,
  id: number
): Promise<ClientProfileResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
      headers: {
        Authorization: `Bearer ${clientauthToken}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response);

    const statusCode = response.status;

    if (!response.ok) {
      const errorData = await response.json();
      return {
        client: { id: 0, email: "", name: "", role: "", facility: { id: 1 } },
        statusCode,
        error: errorData.error || "Failed to fetch profile",
      };
    }

    const data = await response.json();
    return {
      client: data,
      statusCode,
    };
  } catch (error) {
    return {
      client: { id: 0, email: "", name: "", role: "", facility: { id: 1 } },
      statusCode: 500,
      error: (error as Error).message,
    };
  }
};
