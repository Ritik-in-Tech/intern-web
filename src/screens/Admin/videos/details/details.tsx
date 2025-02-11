import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  deleteVideo,
  editVideoApi,
  fetchVideoById,
  generateThumbnailSignedUrl,
  generateVideoSignedUrl,
  uploadFileToS3,
} from "../api.video";
import styles from "./deatils.module.scss";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import {
  getVideoDuration,
  handleVideoListPage,
  logoutAndHeadToAdminLogin,
} from "../../../utils.client";
import { AWS_S3_BUCKET_NAME } from "../../../constant";

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  createdAt: string;
}

interface VideoWithTags extends Video {
  tags: Tag[];
}

interface Tag {
  id: number;
  name: string;
}

const VideoDetailPage = () => {
  const location = useLocation();
  const videoWithTags = location.state?.videoWithTags;
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState<"video" | "thumbnail" | null>(
    null
  );
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("動画IDが指定されていません。");
      return;
    }

    const fetchVideo = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const videoData = await fetchVideoById(parseInt(id, 10), authToken!);
        setVideo(videoData);
      } catch (error) {
        console.error("動画の取得に失敗しました。", error);
        setError("動画の取得に失敗しました。");
      }
    };

    fetchVideo();
  }, [id]);

  const handleDelete = async () => {
    if (!video) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("再度ログインしてください。");
      logoutAndHeadToAdminLogin(navigate);
      return;
    }

    try {
      const result = await deleteVideo(authToken, video.id);
      if (result.statusCode === 200) {
        toast.success("動画の削除に成功しました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/admin/videos");
      } else {
        setError(result.message || "動画の削除に失敗しました。");
        toast.error(result.message || "動画の削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("動画の削除に失敗しました。", error);
      toast.error("動画の削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("動画の削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("動画を削除しますか？")) {
      handleDelete();
    }
  };

  const handleEditClick = () => {
    navigate(`/admin/videos/${id}/edit`, {
      state: { videoWithTags },
    });
  };
  if (error) {
    return <div>{error}</div>;
  }

  if (!video) {
    return <div>Loading...</div>;
  }

  const fetchUpdatedVideoData = async (videoId: number, authToken: string) => {
    const updatedVideo = await fetchVideoById(videoId, authToken);
    console.log(updatedVideo);
    setVideo(updatedVideo);
  };
  const resetVideoEditState = () => {
    setVideo(null);
    setIsUploading(null);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "thumbnail"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !video) return;

    if (type === "video" && file.type !== "video/mp4") {
      toast.error("MP4形式の動画ファイルを選択してください。", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (type === "thumbnail" && file.type !== "image/png") {
      toast.error("PNG形式の画像ファイルを選択してください。", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setIsUploading(type);

    try {
      const authToken = localStorage.getItem("authToken");

      if (type === "thumbnail") {
        const signedThumbnailUrlData = await generateThumbnailSignedUrl(
          video.title,
          video.description,
          authToken!
        );
        const thumbnailFileKey = signedThumbnailUrlData.ThumbnailfileKey;

        if (signedThumbnailUrlData.signedThumbnailUrl && file) {
          await uploadFileToS3(signedThumbnailUrlData.signedThumbnailUrl, file);
        }

        const thumbnailUrl = `https://${AWS_S3_BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${thumbnailFileKey}`;
        console.log(thumbnailUrl);
        try {
          const editResponse = await editVideoApi(video.id, authToken!, {
            thumbnailUrl: thumbnailUrl,
          });
          setVideo((prevVideo) => ({ ...prevVideo!, thumbnailUrl }));
          console.log(video.thumbnailUrl);
          toast.success(`サムネイルのアップロードと更新に成功しました。`, {
            position: "top-center",
            autoClose: 3000,
          });
        } catch (error) {
          throw new Error("サムネイルの更新に失敗しました。");
        }
        resetVideoEditState();
        await fetchUpdatedVideoData(video.id, authToken!);
      } else {
        const signedUrlResponse = await generateVideoSignedUrl(
          video.title,
          video.description,
          authToken!
        );

        const videoFileKey = signedUrlResponse.VideofileKey;

        if (signedUrlResponse.signedVideoUrl && file) {
          await uploadFileToS3(signedUrlResponse.signedVideoUrl, file);
        }

        const videoUrl = `https://${AWS_S3_BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${videoFileKey}`;

        const duration = await getVideoDuration(videoUrl);

        const editResponse = await editVideoApi(video.id, authToken!, {
          videoUrl,
        });

        console.log(editResponse.statusCode);

        try {
          const editResponse = await editVideoApi(video.id, authToken!, {
            videoUrl,
            duration,
          });
          setVideo((prevVideo) => ({ ...prevVideo!, videoUrl }));
          toast.success(`動画のアップロードと更新に成功しました。`, {
            position: "top-center",
            autoClose: 3000,
          });
        } catch (error) {
          throw new Error(editResponse.message || "動画の更新に失敗しました。");
        }
        resetVideoEditState();
        await fetchUpdatedVideoData(video.id, authToken!);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`${type}のアップロードに失敗しました。`, {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsUploading(null);
    }
  };

  const handleVideoUploadClick = () => {
    if (window.confirm("新しい動画をアップロードしますか？")) {
      document.getElementById("videoUpload")?.click();
    }
  };

  const handleThumbnailUploadClick = () => {
    if (window.confirm("新しいサムネイルをアップロードしますか？")) {
      document.getElementById("thumbnailUpload")?.click();
    }
  };

  return (
    <Container
      title="動画詳細"
      routes={[
        {
          text: "動画一覧",
          onClick: () => handleVideoListPage(navigate),
        },
        "動画詳細",
      ]}
      actionButtons={
        <>
          <Button
            title="ビデオを編集する"
            onClick={handleEditClick}
            style={{ marginRight: "8px" }}
          />
          <Button
            title="ビデオを削除する"
            onClick={confirmDelete}
            theme="red"
          />
        </>
      }
    >
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>タイトル</label>
        <p className={styles.detailContent}>{video.title}</p>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>動画の説明</label>
        <p className={styles.detailContent}>{video.description}</p>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>タグ</label>
        <div className={styles.tagContainer}>
          {videoWithTags?.tags.map((tag: Tag) => (
            <span key={tag.id} className={styles.tag}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>動画ファイル</label>
        <div className={styles.videoPlayerBox}>
          <video
            controls
            controlsList="nodownload"
            disablePictureInPicture
            disableRemotePlayback
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <Button
          title={
            isUploading === "video"
              ? "アップロード中..."
              : "別の動画をアップロード"
          }
          onClick={handleVideoUploadClick}
          disabled={isUploading !== null}
        />
        <input
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          id="videoUpload"
          onChange={(e) => handleFileChange(e, "video")}
        />
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>サムネイル</label>
        <div className={styles.thumbnailBox}>
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className={styles.thumbnail}
          />
        </div>
        <Button
          title={
            isUploading === "thumbnail"
              ? "アップロード中..."
              : "別の画像をアップロード"
          }
          onClick={handleThumbnailUploadClick}
          disabled={isUploading !== null}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id="thumbnailUpload"
          onChange={(e) => handleFileChange(e, "thumbnail")}
        />
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>作成した</label>
        <p className={styles.detailContent}>
          {new Date(video.createdAt).toLocaleString()}
        </p>
      </div>
    </Container>
  );
};

export default VideoDetailPage;
