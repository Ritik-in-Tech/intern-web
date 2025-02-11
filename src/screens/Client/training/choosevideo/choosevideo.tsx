import { useState, useEffect } from "react";
import styles from "./choosevideo.module.scss";
import { CiCircleMinus } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import {
  calculateAge,
  formatVideoDuration,
  logoutAndHeadToClientLogin,
} from "../../../utils.client";
import { IoIosArrowBack } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { FaRegFileVideo } from "react-icons/fa";
import {
  fetchVideoMappings,
  fetchVideos,
  getAllTags,
} from "../../../Admin/videos/api.video";
import { useLocation } from "react-router-dom";
import { fetchUserById } from "../../users/api.users";
import { Pagination } from "../../../components/Pagination";
import { getPageNumbers } from "../../../components/Pagination/getpagenumber";
import TrainingLayout from "../trainingLayout";
import { Button } from "../../../components/Button";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  duration?: number;
}

interface Tag {
  id: number;
  name: string;
}

interface VideoMapping {
  video_id: number;
  video_tag_id: number;
  createdAt: string;
  updatedAt: string;
}

interface VideoWithTags extends Video {
  tags: Tag[];
}

interface User {
  id: number;
  name: string;
  dateOfBirth: string;
}

const ChooseVideos = () => {
  const location = useLocation();
  const [videoList, setVideosList] = useState<Video[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoPerPage = 15;
  const [videosWithTags, setVideosWithTags] = useState<VideoWithTags[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIds = searchParams.get("users")?.split(",").map(Number) || [];
    const videoIds = searchParams.get("videos")?.split(",").map(Number) || [];

    const fetchUserDetails = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      if (!authToken) {
        console.error("再度ログインしてください。");
        logoutAndHeadToClientLogin(navigate);
        return;
      }

      try {
        const userPromises = userIds.map((id) => fetchUserById(authToken, id));
        const users = await Promise.all(userPromises);
        setSelectedUsers(users);
      } catch (error) {
        console.error("ユーザーの取得に失敗しました。", error);
      }
    };

    if (userIds.length > 0) {
      fetchUserDetails();
    }
    const getVideos = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const videos = await fetchVideos(authToken!);
        setVideosList(videos);
        const mappingsData: VideoMapping[] = await fetchVideoMappings(
          authToken!
        );
        const tagsData: Tag[] = await getAllTags(authToken!);
        const videosWithTagsData: VideoWithTags[] = videos.map(
          (video: Video) => ({
            ...video,
            tags: mappingsData
              .filter((mapping: VideoMapping) => mapping.video_id === video.id)
              .map((mapping: VideoMapping) =>
                tagsData.find((tag: Tag) => tag.id === mapping.video_tag_id)
              )
              .filter((tag: Tag | undefined): tag is Tag => tag !== undefined),
          })
        );

        setVideosWithTags(videosWithTagsData);
      } catch (error) {
        setError("ワークアウト動画の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getVideos();
  }, [location.search]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const indexOfLastVideo = currentPage * videoPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videoPerPage;
  const currentVideo = videoList.slice(indexOfFirstVideo, indexOfLastVideo);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleGoBack = () => {
    navigate("/clients/users");
  };

  const totalPages = Math.ceil(videoList.length / videoPerPage);

  const handleVideoClick = (video: Video) => {
    setSelectedVideos([...selectedVideos, video]);
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
  };

  const handleGoParticipantsPage = () => {
    const videoIds = selectedVideos.map((video) => video.id).join(",");
    const userIds = new URLSearchParams(location.search).get("users") || "";
    navigate(
      `/clients/training_tracks/new/participants?videos=${videoIds}&users=${userIds}`,
      { state: { selectedUsers, selectedVideos } }
    );
  };

  const handleNavigateToWatchVideo = () => {
    const videoIds = selectedVideos.map((video) => video.id).join(",");
    const userIds = new URLSearchParams(location.search).get("users") || "";
    navigate(
      `/clients/training_tracks/video?videos=${videoIds}&users=${userIds}`,
      { state: { selectedUsers, selectedVideos } }
    );
  };

  return (
    <TrainingLayout>
      <div className={styles.mainVideoContainer}>
        <div className={styles.titleContainer}>
          <div className={styles.backButton} onClick={() => handleGoBack()}>
            <IoIosArrowBack className={styles.backIcon} />
            <p className={styles.title}>ワークアウトをやめる</p>
          </div>
        </div>
        <div className={styles.videosContainer}>
          <h2 className={styles.sectionTitle}>動画を選択してください</h2>
          <div className={styles.videoList}>
            {currentVideo.map((video) => {
              const videoWithTags = videosWithTags.find(
                (v) => v.id === video.id
              );
              return (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className={styles.clickableVideo}
                >
                  <div className={styles.thumbnailContainer}>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className={styles.thumbnail}
                    />
                    <div className={styles.duration}>
                      {video?.duration
                        ? formatVideoDuration(video.duration)
                        : "--:--"}
                    </div>
                  </div>
                  <div className={styles.mainDetailsContainer}>
                    <p className={styles.videoTitle}>{video.title}</p>
                    <div className={styles.tagContainer}>
                      {videoWithTags?.tags.map((tag) => (
                        <span key={tag.id} className={styles.tag}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
            getPageNumbers={getPageNumbers}
          />
        </div>
      </div>
      <div className={styles.selectMainContainer}>
        <div className={styles.selectContainer}>
          <div className={styles.top}>
            <MdGroups className={styles.groupIcon} />
            <div className={styles.mainmember}>
              <div className={styles.member}>
                <p className={styles.memberTitle}>メンバー</p>
                <p className={styles.memberItems}>
                  {selectedUsers.length}名選択中
                </p>
              </div>
              <div
                className={styles.resetUsers}
                onClick={handleGoParticipantsPage}
              >
                <p className={styles.resetText}>変更する</p>
              </div>
            </div>
          </div>
          <div className={styles.selectedUsersTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>氏名</th>
                  <th>年齢</th>
                </tr>
              </thead>
              <tbody>
                {selectedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{calculateAge(user.dateOfBirth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.videoContainer}>
          <div className={styles.videotop}>
            <FaRegFileVideo className={styles.videoIcon} />
            <div className={styles.mainmember}>
              <div className={styles.member}>
                <p className={styles.memberTitle}>セットリスト</p>
                <p className={styles.memberItems}>
                  {selectedVideos.length
                    ? `${selectedVideos.length}本選択済み`
                    : ""}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.selectedVideosContainer}>
            {selectedVideos.map((video, index) => (
              <div key={index} className={styles.selectedVideoRow}>
                <CiCircleMinus
                  className={styles.removeIcon}
                  onClick={() => handleRemoveVideo(index)}
                />
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={styles.selectedVideoThumbnail}
                />
                <p className={styles.selectedVideoTitle}>{video.title}</p>
              </div>
            ))}
          </div>
        </div>
        <Button
          title="ワークアウト動画を決定"
          onClick={handleNavigateToWatchVideo}
          disabled={selectedVideos.length === 0}
        />
      </div>
    </TrainingLayout>
  );
};

export default ChooseVideos;
