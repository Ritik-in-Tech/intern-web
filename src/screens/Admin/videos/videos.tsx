import { useState, useEffect, useRef } from "react";
import styles from "./videos.module.scss";
import { useNavigate } from "react-router-dom";
import { fetchVideoMappings, fetchVideos, getAllTags } from "./api.video";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Pagination } from "../../components/Pagination";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { formatVideoDuration } from "../../utils.client";
import { toast } from "react-toastify";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
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

const Videos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [videoMappings, setVideoMappings] = useState<VideoMapping[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [videosWithTags, setVideosWithTags] = useState<VideoWithTags[]>([]);
  const videosPerPage = 8;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const fetchData = async () => {
        try {
          const videosData: Video[] = await fetchVideos(authToken);
          const mappingsData: VideoMapping[] = await fetchVideoMappings(
            authToken
          );
          // console.log(mappingsData);
          const tagsData: Tag[] = await getAllTags(authToken);
          console.log(tagsData);

          setVideos(videosData);
          setVideoMappings(mappingsData);
          setTags(tagsData);

          console.log(mappingsData);

          console.log(tagsData);
          const videosWithTagsData: VideoWithTags[] = videosData.map(
            (video: Video) => ({
              ...video,
              tags: mappingsData
                .filter(
                  (mapping: VideoMapping) => mapping.video_id === video.id
                )
                .map((mapping: VideoMapping) =>
                  tagsData.find((tag: Tag) => tag.id === mapping.video_tag_id)
                )
                .filter(
                  (tag: Tag | undefined): tag is Tag => tag !== undefined
                ),
            })
          );

          setVideosWithTags(videosWithTagsData);
        } catch (error) {
          console.error("データの取得に失敗しました。", error);
        }
      };

      fetchData();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSelectedVideoId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalPages = Math.ceil(videos.length / videosPerPage);

  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Container
      title="動画一覧"
      routes={["動画一覧"]}
      actionButtons={
        <Button
          title="＋ 新規登録"
          onClick={() => navigate("/admin/videos/upload")}
        />
      }
    >
      <div className={styles.videoContainer}>
        <div className={styles.videoList}>
          {currentVideos.map((video) => {
            const videoWithTags = videosWithTags.find((v) => v.id === video.id);
            return (
              <div key={video.id}>
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
                  <div className={styles.detailsContainer}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    <div
                      className={styles.options}
                      onClick={() => {
                        console.log("Options clicked for video id:", video.id);
                        setSelectedVideoId(video.id);
                      }}
                    >
                      &#8942;
                    </div>
                    {selectedVideoId === video.id && (
                      <div ref={dropdownRef} className={styles.dropdownMenu}>
                        <div
                          className={styles.dropdownItem}
                          onClick={() => {
                            const videoWithTags = videosWithTags.find(
                              (v) => v.id === video.id
                            );
                            navigate(`/admin/videos/${video.id}`, {
                              state: { videoWithTags },
                            });
                          }}
                        >
                          詳細を見る
                        </div>
                      </div>
                    )}
                  </div>
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        getPageNumbers={getPageNumbers}
      />
    </Container>
  );
};

export default Videos;
