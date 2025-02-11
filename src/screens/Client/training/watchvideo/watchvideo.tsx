import { useState, useEffect, useRef } from "react";
import styles from "../choosevideo/choosevideo.module.scss";
import style from "./watchvideo.module.scss";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { FaRegFileVideo } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  fetchVideoMappings,
  fetchVideos,
  getAllTags,
} from "../../../Admin/videos/api.video";
import { useLocation } from "react-router-dom";
import { fetchUserById } from "../../users/api.users";
import { toast } from "react-toastify";
import {
  ViewingHistoryData,
  ViewingHistoryResponse,
  addViewingHistory,
  createTrainingHistory,
} from "../training.api";
import { Pagination } from "../../../components/Pagination";
import { getPageNumbers } from "../../../components/Pagination/getpagenumber";
import {
  formatVideoDuration,
  getVideosWithTags,
  logoutAndHeadToClientLogin,
  Tag,
  Video,
  VideoMapping,
  VideoWithTags,
} from "../../../utils.client";
import TrainingLayout from "../trainingLayout";

interface User {
  id: number;
  name: string;
  dateOfBirth: string;
}

const WatchVideo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userIds = searchParams.get("users")?.split(",")?.map(Number) || [];
  const videoIds = searchParams.get("videos")?.split(",")?.map(Number) || [];

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [allvideosWithTags, setAllVideosWithTags] = useState<VideoWithTags[]>(
    []
  );
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderOfPlaying, setOrderOfPlaying] = useState<number>(0);

  const videoPerPage = 10;

  const selectedVideosContainerRef = useRef<HTMLDivElement>(null);
  const videoListRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const handleGoBack = () => {
    navigate("/clients/users");
  };

  const handleGoParticipantsPage = () => {
    const videoIds = selectedVideos.map((video) => video.id).join(",");
    const userIds = new URLSearchParams(location.search).get("users") || "";
    navigate(
      `/clients/training_tracks/new/participants?videos=${videoIds}&users=${userIds}`,
      { state: { selectedUsers } }
    );
  };

  const playSelectedVideo = (video: Video, index: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOrderOfPlaying(index);
    if (playingVideo?.id === video.id) {
      playerRef.current?.play();
    } else {
      setPlayingVideo(video);
    }
    setTimeout(() => {
      if (selectedVideosContainerRef.current) {
        selectedVideosContainerRef.current.scrollTop =
          selectedVideosContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleVideoOnBottomList = (video: Video) => {
    let newOrderOfPlaying = orderOfPlaying + 1;
    addVideoToList(video, newOrderOfPlaying);
    if (playerRef.current?.paused) {
      playSelectedVideo(video, newOrderOfPlaying);
    }
  };

  const handleVideoOnSetList = (video: Video, index: number) => {
    playSelectedVideo(video, index);
  };

  const handleViewingHistory = async () => {
    const authToken = localStorage.getItem("clientauthToken");
    if (!authToken) {
      console.error("再度ログインしてください。");
      toast.error("再度ログインしてください。");
      logoutAndHeadToClientLogin(navigate);
      return;
    }

    if (selectedVideos.length === 0 || selectedUsers.length === 0) {
      toast.error("ワークアウト動画とユーザーを選択してください。");
      return;
    }

    try {
      const trainingHistoryData = {};
      const trainingHistoryResponse = await createTrainingHistory(
        trainingHistoryData,
        authToken
      );

      const trainingHistoryId = trainingHistoryResponse.id;
      const viewingHistoryPromises: Promise<ViewingHistoryResponse>[] = [];

      selectedVideos.forEach((video) => {
        const data: ViewingHistoryData = {
          contentId: video.id,
          trainingHistoryId: trainingHistoryId,
        };
        viewingHistoryPromises.push(addViewingHistory(data, authToken));
      });

      const viewingHistoryResults = await Promise.all(viewingHistoryPromises);
      console.log("viewingHistoryResults:", viewingHistoryResults);

      const selectedUserIds = selectedUsers.map((user) => user.id).join(",");
      if (viewingHistoryResults) {
        toast.success("ワークアウト動画の視聴履歴が追加されました。");
        navigate(`/clients/training_tracks/form?users=${selectedUserIds}`, {
          state: { trainingHistoryId },
        });
      }
    } catch (error) {
      console.error("ワークアウト動画の視聴履歴の追加に失敗しました。", error);
      toast.error("ワークアウト動画の視聴履歴の追加に失敗しました。");
    }
  };

  const handleDeleteTrainedVideo = (
    index: number,
    e: React.MouseEvent<SVGElement>
  ) => {
    e.stopPropagation();
    if (index === orderOfPlaying) {
      // if user delete the playing video
      if (selectedVideos.length > index + 1) {
        // if  there are more videos in the list
        playSelectedVideo(selectedVideos[orderOfPlaying + 1], orderOfPlaying);
      } else {
        setOrderOfPlaying(selectedVideos.length - 2);
      }
    } else if (index < orderOfPlaying) {
      setOrderOfPlaying(orderOfPlaying - 1);
    }
    setSelectedVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));
  };

  const addVideoToList = (
    video: Video,
    order: number = selectedVideos.length
  ) => {
    setSelectedVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      newVideos.splice(order, 0, video);
      return newVideos;
    });
    setTimeout(() => {
      if (selectedVideosContainerRef.current) {
        selectedVideosContainerRef.current.scrollTop =
          selectedVideosContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const handleVideoEnd = () => {
    if (orderOfPlaying < selectedVideos.length - 1) {
      playSelectedVideo(selectedVideos[orderOfPlaying + 1], orderOfPlaying + 1);
    } else {
      setTimeout(() => {
        if (videoListRef.current) {
          videoListRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  };

  const indexOfLastVideo = currentPage * videoPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videoPerPage;
  const currentVideos = allvideosWithTags.slice(
    indexOfFirstVideo,
    indexOfLastVideo
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(allvideosWithTags.length / videoPerPage);

  const fetchVideoDetails = async () => {
    const authToken = localStorage.getItem("clientauthToken");
    if (!authToken) {
      console.error("再度ログインしてください。");
      logoutAndHeadToClientLogin(navigate);
      return;
    }
    try {
      const allVideos = await fetchVideos(authToken);

      const mappingsData: VideoMapping[] = await fetchVideoMappings(authToken!);
      const tagsData: Tag[] = await getAllTags(authToken!);

      const res: VideoWithTags[] = getVideosWithTags(
        allVideos,
        mappingsData,
        tagsData
      );
      setAllVideosWithTags(res);
    } catch (error) {
      console.error("ワークアウト動画の取得に失敗しました。", error);
    }
  };

  useEffect(() => {
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
  }, [location.search]);
  useEffect(() => {
    const initialVideos: VideoWithTags[] = videoIds
      .map((id) => allvideosWithTags.find((video) => video.id === id))
      .filter((video): video is VideoWithTags => video !== undefined);
    if (initialVideos.length > 0) {
      setSelectedVideos(initialVideos);
      setPlayingVideo(initialVideos[0]);
      if (playerRef.current) {
      }
    }

    if (allvideosWithTags.length == 0) {
      fetchVideoDetails();
    }
  }, [allvideosWithTags]);

  return (
    <TrainingLayout>
      <div className={style.container}>
        <div className={styles.mainVideoContainer}>
          {selectedVideos.length === 0 && (
            <div className={styles.titleContainer}>
              <div className={styles.backButton} onClick={() => handleGoBack()}>
                <IoIosArrowBack className={styles.backIcon} />
                <p className={styles.title}>ワークアウトをやめる</p>
              </div>
            </div>
          )}
          {playingVideo && (
            <div>
              <div className={styles.videosContainer}>
                <div className={style.videoPlay}>
                  <video
                    src={playingVideo.videoUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    disableRemotePlayback
                    autoPlay
                    className={style.videoPlayer}
                    onEnded={handleVideoEnd}
                    ref={playerRef}
                  />
                </div>
                <div className={style.detail}>
                  <h3 className={style.title}>{playingVideo.title}</h3>
                  <p className={style.description}>
                    {playingVideo.description}
                  </p>
                  <div className={style.tagContainer}>
                    {playingVideo.tags.map((tag: Tag) => (
                      <span key={tag.id} className={style.tag}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={style.videosContainer} ref={videoListRef}>
            <div className={styles.videoList}>
              {currentVideos.map((video: Video) => {
                const videoWithTags = allvideosWithTags.find(
                  (v) => v.id === video.id
                );
                return (
                  <div
                    key={video.id}
                    onClick={() => handleVideoOnBottomList(video)}
                    className={style.selectVideo}
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
                      <div className={styles.titleContainer}>
                        <p className={styles.videoTitle}>{video.title}</p>
                      </div>
                      <div className={style.tagContainer}>
                        {videoWithTags?.tags.map((tag) => (
                          <span key={tag.id} className={style.tag}>
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
      </div>
      <div className={styles.selectMainContainer}>
        <div className={styles.selectContainer}>
          <div className={styles.top}>
            <MdGroups className={style.groupIcon} />
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
          <div
            className={styles.selectedVideosContainer}
            ref={selectedVideosContainerRef}
          >
            {selectedVideos.map((video, index) => (
              <div
                key={`${video.id}-${index}`}
                className={`${styles.selectedVideoRow} ${
                  orderOfPlaying === index ? style.playingVideo : ""
                }`}
                onClick={() => handleVideoOnSetList(video, index)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={styles.selectedVideoThumbnail}
                />
                <p className={styles.selectedVideoTitle}>{video.title}</p>
                <RiDeleteBin6Line
                  className={style.deleteIcon}
                  onClick={(e) => handleDeleteTrainedVideo(index, e)}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          className={styles.submitButton}
          onClick={handleViewingHistory}
          disabled={selectedVideos.length === 0}
        >
          ワークアウトを終了する
        </button>
      </div>
    </TrainingLayout>
  );
};

export default WatchVideo;
