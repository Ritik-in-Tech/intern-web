import { ADMIN_LOGIN_URL, CLIENT_LOGIN_URL } from "./constant";
import { NavigateFunction } from "react-router-dom";

export const formatDateOfBirth = (dateString: string) => {
  console.log(dateString);
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export function calculateAge(dobString: string) {
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())
  ) {
    age--;
  }
  return age;
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const dateFormat = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
  const timeFormat = new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${dateFormat} ${timeFormat}`;
};

export const formatGender = (gender: string) => {
  switch (gender) {
    case "Male":
      return "男性";
    case "Female":
      return "女性";
    case "Other":
      return "その他";
  }
};

export const clearLocalStorage = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("clientauthToken");
  localStorage.removeItem("clientId");
};

export const logoutAndHeadToClientLogin = (
  navigate: (path: string) => void
) => {
  clearLocalStorage();
  navigate(CLIENT_LOGIN_URL);
};

export const logoutAndHeadToAdminLogin = (navigate: (path: string) => void) => {
  clearLocalStorage();
  navigate(ADMIN_LOGIN_URL);
};

export const getVideoDuration = (videoUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement("video");
    videoElement.src = videoUrl;
    videoElement.addEventListener("loadedmetadata", () => {
      resolve(videoElement.duration);
    });
    videoElement.addEventListener("error", (error) => {
      reject(error);
    });
  });
};

export const formatVideoDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export interface Video {
  [x: string]: any;
  id: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface VideoMapping {
  video_id: number;
  video_tag_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoWithTags extends Video {
  tags: Tag[];
}

export function getVideosWithTags(
  allVideos: Video[],
  mappingsData: VideoMapping[],
  tagsData: Tag[]
): VideoWithTags[] {
  return allVideos.map((video: Video) => ({
    ...video,
    tags: mappingsData
      .filter((mapping: VideoMapping) => mapping.video_id === video.id)
      .map((mapping: VideoMapping) =>
        tagsData.find((tag: Tag) => tag.id === mapping.video_tag_id)
      )
      .filter((tag: Tag | undefined): tag is Tag => tag !== undefined),
  }));
}

export const FunctionalLevelOptions = [
  { value: "", label: "選択してください" },
  { value: "Independence", label: "自立" },
  { value: "Support required 1", label: "要支援１" },
  { value: "Support required 2", label: "要支援２" },
  { value: "Nursing care required 1", label: "要介護１" },
  { value: "Nursing care required 2", label: "要介護２" },
  { value: "Nursing care required 3", label: "要介護３" },
  { value: "Nursing care required 4", label: "要介護４" },
  { value: "Nursing care required 5", label: "要介護５" },
];

export const formatFunctionalLevel = (level: string) => {
  switch (level) {
    case "Independence":
      return "自立";
    case "Support required 1":
      return "要支援１";
    case "Support required 2":
      return "要支援2";
    case "Nursing care required 1":
      return "要介護１";
    case "Nursing care required 2":
      return "要介護２";
    case "Nursing care required 3":
      return "要介護３";
    case "Nursing care required 4":
      return "要介護４";
    case "Other":
      return "要介護５";
  }
};

export const sortUsersByName = (users: any) => {
  return users.sort((a: any, b: any) => a.name.localeCompare(b.name));
};

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  } else {
    return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
}

export function formatDurationJP(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}時間${minutes}分${remainingSeconds}秒`;
  } else {
    return `${minutes}分${remainingSeconds}秒`;
  }
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export const handleMainPage = (navigate: NavigateFunction): void => {
  navigate("/admin/companies");
};

export const handleVideoListPage = (navigate: NavigateFunction): void => {
  navigate("/admin/videos");
};

export const handleCompanyDetails = (
  navigate: NavigateFunction,
  companyId: number
) => {
  navigate(`/admin/companies/${companyId}`);
};

export const handleUserListPage = (navigate: NavigateFunction): void => {
  navigate("/clients/users");
};

export const handleTrainerListPage = (navigate: NavigateFunction): void => {
  navigate("/clients/trainers");
};

export const handleTrainingHistoryListPage = (
  navigate: NavigateFunction
): void => {
  navigate("/clients/training_tracks");
};
