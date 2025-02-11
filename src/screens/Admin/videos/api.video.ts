import axios from "axios";
import { API_BASE_URL } from "../../constant";

export const generateVideoSignedUrl = async (
  title: string,
  description: string,
  authToken: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/videos/generate-video-signed-url`,
      {
        title,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to generate signed URL");
    }
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

export const generateThumbnailSignedUrl = async (
  title: string,
  description: string,
  authToken: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/videos/generate-thumbnail-signed-url`,
      {
        title,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to generate signed URL");
    }
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
};

export const saveVideo = async (
  title: string,
  description: string,
  videoUrl: string,
  thumbnailUrl: string,
  adminId: number,
  fileKey: string,
  authToken: string,
  duration: number
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/videos`,
      {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        adminId,
        fileKey,
        duration,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("Server response:", response.data);

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error(
        "Failed to save videos. Server responded with an unexpected status code."
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios error
      console.error("Axios error:", error.response?.data || error.message);
    } else {
      // General error
      console.error("General error in saving videos:", error);
    }
    throw error;
  }
};

export const uploadFileToS3 = (
  signedUrl: string,
  file: File,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onUploadProgress) {
      xhr.upload.onprogress = onUploadProgress;
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve();
      } else {
        reject(
          new Error(
            `Upload failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed."));
    };

    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
};

export const fetchVideos = async (authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/videos`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

export const fetchVideoById = async (id: number, authToken: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/videos/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    throw error;
  }
};

export const editVideoApi = async (
  id: number,
  authToken: string,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
  }
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/videos/${id}/edit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating video:", error);
    throw error;
  }
};

export const deleteVideo = async (
  authToken: string,
  id: Number
): Promise<{ statusCode: number; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/videos/${id}`, {
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

export const getAllTags = async (authToken: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

interface Tag {
  id: number;
  name: string;
}

export const createTag = async (
  name: string,
  authToken: string
): Promise<Tag> => {
  const response = await fetch(`${API_BASE_URL}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create tag");
  }

  return response.json();
};

export const mapVideoToTags = async (
  videoId: number,
  tagId: number,
  authToken: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/videoTags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ video_id: videoId, video_tag_id: tagId }),
  });

  console.log(response);

  if (!response.ok) {
    throw new Error("Failed to map video to tag");
  }

  return;
};

export const getTagByName = async (
  name: string,
  authToken: string
): Promise<Tag> => {
  const response = await fetch(`${API_BASE_URL}/tags/${name}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get tag by name: ${name}`);
  }

  return response.json();
};

interface VideoMapping {
  video_id: number;
  video_tag_id: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchVideoMappings = async (
  authToken: string
): Promise<VideoMapping[]> => {
  const response = await fetch(`${API_BASE_URL}/videoTags`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video mappings");
  }

  return response.json();
};

export const deleteVideoTagMapping = async (
  video_id: number,
  video_tag_id: number,
  authToken: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/videoTags/${video_id}/${video_tag_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete video tag mapping");
  }
};
