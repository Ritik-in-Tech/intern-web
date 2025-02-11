import { API_BASE_URL } from "../../constant";

export const getResetPasswordUrl = async (
  type: string,
  email: string
): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/password/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  type: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/password/reset-password/${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword, type: type }),
      }
    );

    // console.log(JSON.stringify({ password: newPassword, type: type }));

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};
