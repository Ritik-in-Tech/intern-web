import { useState, useEffect } from "react";
import userstyles from "../../users/users.module.scss";
import styles from "./history.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchVideoById,
  fetchVideoMappings,
  getAllTags,
} from "../../../Admin/videos/api.video";
import {
  calculateAge,
  formatDateTime,
  formatDurationJP,
  formatVideoDuration,
  handleTrainingHistoryListPage,
} from "../../../utils.client";
import { Container } from "../../../components/Container";

interface UserReport {
  createdAt: string;
  totalUniqueUsers: {
    id: number;
    name: string;
    dateOfBirth: string;
    data: {
      physical: number;
      emotional: number;
    };
  }[];
  totalUniqueViewingHistory: {
    contentId: number;
  }[];
}

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

export const messagesOfPhysicalStates = [
  "体調や症状が明らかに悪化した。",
  "体調や症状が悪化した。",
  "時々悪化した部分を感じる。",
  "体調や症状が悪化した気がするが、わからない。",
  "特に体調や症状に変わりはない。",
  "体調や症状がよくなった気はするが、まだよくわからない。",
  "体調や症状が改善した所もあるが、変わっていない所もまだある。",
  "概ね体調や症状は改善した。",
  "体調や症状が改善した。",
  "体調や症状が明らかに改善した。",
];

export const messagesOfPsychologicalStates = [
  "気分が全く晴れない。情緒が明らかに不安定になった。",
  "気分が晴れなくなった。情緒が不安定になった。",
  "気分や情緒が不安定になった所を感じる。",
  "気分や情緒が不安定になった気がするが、わからない。",
  "気分や情緒に変わりはない。",
  "気分や情緒も安定した気はするが、まだよくわからない。",
  "気分や情緒は安定しているが、変わっていない所もある。",
  "概ね気分が晴れた。情緒も安定した。",
  "気分が晴れた。情緒が安定した。",
  "気分が晴れた。情緒が明らかに安定した。",
];

const ShowTrainingHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData as UserReport | undefined;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoMappings, setVideoMappings] = useState<VideoMapping[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [videosWithTags, setVideosWithTags] = useState<VideoWithTags[]>([]);
  const [videosList, setVideosList] = useState<Video[]>([]);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  console.log(reportData);

  useEffect(() => {
    const getVideos = async () => {
      if (!reportData) {
        setError("No report data available");
        setLoading(false);
        return;
      }
      const authToken = localStorage.getItem("clientauthToken");
      if (!authToken) {
        setError("No auth token found");
        setLoading(false);
        return;
      }
      try {
        const contentIds = reportData.totalUniqueViewingHistory.map(
          (item) => item.contentId
        );
        const videosPromises = contentIds.map((id) =>
          fetchVideoById(id, authToken)
        );
        const videos = await Promise.all(videosPromises);
        setVideosList(videos);

        const mappingsData: VideoMapping[] = await fetchVideoMappings(
          authToken
        );
        const tagsData: Tag[] = await getAllTags(authToken);

        setVideoMappings(mappingsData);
        setTags(tagsData);

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

        const totalDuration = videos.reduce(
          (sum, video) => sum + (video.duration || 0),
          0
        );

        setVideosWithTags(videosWithTagsData);
        setTotalDuration(totalDuration);
      } catch (error) {
        setError("Failed to fetch videos");
      } finally {
        setLoading(false);
      }
    };

    getVideos();
  }, [reportData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container
      title={formatDateTime(reportData!.createdAt)}
      routes={[
        {
          text: "ワークアウト履歴一覧",
          onClick: () => handleTrainingHistoryListPage(navigate),
        },
        ,
        "ワークアウト詳細",
      ]}
    >
      <div className={styles.userContainer}>
        <h5 className={styles.title}>参加者一覧</h5>
        <div className={userstyles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>氏名</th>
                <th>年齢</th>
                <th>身体の変化について</th>
                <th>気持ちの変化について</th>
              </tr>
            </thead>
            <tbody>
              {reportData!.totalUniqueUsers.map((user) => (
                <tr key={user.id}>
                  <td
                    className={styles.name}
                    onClick={() =>
                      navigate(`/clients/training_tracks/userReport/${user.id}`)
                    }
                  >
                    {user.name}
                  </td>
                  <td>{calculateAge(user.dateOfBirth)}</td>
                  <td>
                    <span className={styles.stateValue}>
                      {user.data.physical}
                    </span>
                    {messagesOfPhysicalStates[user.data.physical - 1]}
                  </td>
                  <td>
                    <span className={styles.stateValue}>
                      {user.data.emotional}
                    </span>
                    {messagesOfPsychologicalStates[user.data.emotional - 1]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.videoContainer}>
        <h5 className={styles.title}>視聴した動画</h5>
        <div className={styles.totalDuration}>
          合計再生時間
          <span>{formatDurationJP(totalDuration)}</span>
        </div>
        <div className={styles.videoList}>
          {videosWithTags.map((video, index) => {
            const videoWithTags = videosWithTags.find((v) => v.id === video.id);
            return (
              <div key={video.id} className={styles.videoItem}>
                <div className={styles.videoNumber}>{index + 1}.</div>
                <div className={styles.thumbnailContainer}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className={styles.thumbnail}
                  />
                </div>
                <div className={styles.duration}>
                  {video?.duration
                    ? formatVideoDuration(video.duration)
                    : "--:--"}
                </div>
                <div className={styles.mainDetailsContainer}>
                  <div className={styles.title}>{video.title}</div>
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
      </div>
    </Container>
  );
};

export default ShowTrainingHistory;
