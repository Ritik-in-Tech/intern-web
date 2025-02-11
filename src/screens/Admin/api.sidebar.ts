import { API_BASE_URL } from "../constant";
export interface AdminProfile {
  id: number;
  email: string;
  name: string;
}
export interface AdminProfileResponse {
  admin: AdminProfile;
  statusCode: number;
  error?: string;
}

export const fetchAdminProfile = async (
  authToken: string
): Promise<AdminProfileResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    const statusCode = response.status;

    if (!response.ok) {
      const errorData = await response.json();
      return {
        admin: { id: 0, email: "", name: "" },
        statusCode,
        error: errorData.error || "Failed to fetch profile",
      };
    }

    const data = await response.json();
    // console.log(data);
    const adminDetails = data.admin;
    // console.log(adminDetails);
    return {
      admin: adminDetails,
      statusCode,
    };
  } catch (error) {
    return {
      admin: { id: 0, email: "", name: "" },
      statusCode: 500,
      error: (error as Error).message,
    };
  }
};
