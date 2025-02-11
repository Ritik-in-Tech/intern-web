import React, { useRef, ChangeEvent, useState, useEffect } from "react";
import style from "./upload.module.scss";
// import styles from "../videos.module.scss";
import { toast } from "react-toastify";
import {
  uploadFileToS3,
  generateThumbnailSignedUrl,
  generateVideoSignedUrl,
  saveVideo,
  getAllTags,
  createTag,
  mapVideoToTags,
  getTagByName,
} from "../api.video";
import { AdminProfileResponse, fetchAdminProfile } from "../../api.sidebar";
import CreatableSelect from "react-select/creatable";
import { useNavigate } from "react-router-dom";
import { Container } from "../../../components/Container";
import {
  getVideoDuration,
  handleVideoListPage,
  logoutAndHeadToAdminLogin,
} from "../../../utils.client";
import { AWS_S3_BUCKET_NAME } from "../../../constant";

interface Tag {
  id: number;
  name: string;
}

interface Option {
  value: number | string;
  label: string;
  __isNew__?: boolean;
}

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Option[]>([]);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [videoFile, setVideoFile] = useState<File | undefined>(undefined);
  const [thumbnailFile, setThumbnailFile] = useState<File | undefined>(
    undefined
  );
  const [profile, setProfile] = useState<{ id: number }>({ id: 1 });
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const fetchTags = async () => {
      const fetchedTags = await getAllTags(authToken!);
      const formattedTags = fetchedTags.map((tag: Tag) => ({
        value: tag.id,
        label: tag.name,
      }));
      setTags(formattedTags);
    };
    fetchTags();
  }, []);

  // Event Handlers
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleTagChange = (newValue: readonly Option[], actionMeta: any) => {
    setSelectedTags(newValue as Option[]);
  };

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    if (file) {
      if (file.type !== "video/mp4") {
        toast.error("MP4形式の動画ファイルのみが許可されます。");
        setVideoFile(undefined);
        e.target.value = "";
        videoFileRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        setVideoFile(file);
      }
    }
  };

  const handleThumbnailFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    if (file) {
      if (file.type !== "image/png") {
        toast.error("PNG形式の画像ファイルのみが許可されます。");
        setThumbnailFile(undefined);
        e.target.value = "";
        thumbnailFileRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setUploading(true);
    const authToken = localStorage.getItem("authToken");
    // Validation
    if (!title) {
      toast.error("タイトルは必須です。");
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setUploading(false);
      return;
    }

    if (!description) {
      toast.error("説明は必須です。");
      titleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setUploading(false);
      return;
    }

    if (!videoFile) {
      toast.error("動画ファイルが必要です。");
      videoFileRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setUploading(false);
      return;
    }
    // else {
    //   const MAX_VIDEO_SIZE_MB = 100;
    //   if (videoFile.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
    //     toast.error(
    //       `動画ファイルのサイズが ${MAX_VIDEO_SIZE_MB}MBを超えています。`
    //     );
    //     videoFileRef.current?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center",
    //     });
    //     setUploading(false);
    //     return;
    //   }
    // }

    if (!thumbnailFile) {
      toast.error("サムネイルファイルが必要です。");
      thumbnailFileRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setUploading(false);
      return;
    }
    // else {
    //   const MAX_THUMBNAIL_SIZE_MB = 100;
    //   if (thumbnailFile.size > MAX_THUMBNAIL_SIZE_MB * 1024 * 1024) {
    //     toast.error(
    //       `サムネイルファイルのサイズが ${MAX_THUMBNAIL_SIZE_MB}MBを超えています。`
    //     );
    //     thumbnailFileRef.current?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "center",
    //     });
    //     setUploading(false);
    //     return;
    //   }
    // }

    try {
      const result: AdminProfileResponse = await fetchAdminProfile(authToken!);
      if (result.error) {
        if (result.error.includes("Token")) {
          toast.error("再度ログインしてください。");
          logoutAndHeadToAdminLogin(navigate);
        } else {
          toast.error(
            "プロフィールの取得に失敗しました。後で再度お試しください。"
          );
        }
      } else {
        setProfile({
          id: result.admin.id,
        });
      }
      const signedVideoUrlData = await generateVideoSignedUrl(
        title,
        description,
        authToken!
      );
      const videoFileKey = signedVideoUrlData.VideofileKey;
      const signedThumbnailUrlData = await generateThumbnailSignedUrl(
        title,
        description,
        authToken!
      );
      const thumbnailFileKey = signedThumbnailUrlData.ThumbnailfileKey;
      setUploadProgress(0);

      // Upload video file to S3
      if (signedVideoUrlData.signedVideoUrl && videoFile) {
        await uploadFileToS3(
          signedVideoUrlData.signedVideoUrl,
          videoFile,
          (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          }
        );
      }

      // Upload thumbnail file to S3
      if (signedThumbnailUrlData.signedThumbnailUrl && thumbnailFile) {
        await uploadFileToS3(
          signedThumbnailUrlData.signedThumbnailUrl,
          thumbnailFile,
          (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          }
        );
      }

      setUploadProgress(null);
      toast.success("ファイルは正常にアップロードされました。");

      const newTags = selectedTags.filter((tag) => tag.__isNew__);
      const uniqueNewTags = Array.from(
        new Set(newTags.map((tag) => tag.label))
      );

      const createdTags = await Promise.all(
        uniqueNewTags.map(async (tagName) => {
          try {
            return await createTag(tagName, authToken!);
          } catch (error) {
            console.warn(
              `Failed to create tag "${tagName}". Fetching existing tag.`
            );
            return await getTagByName(tagName, authToken!);
          }
        })
      );

      // Combine existing and newly created tag IDs
      const tagIds = [
        ...selectedTags
          .filter((tag) => !tag.__isNew__)
          .map((tag) => tag.value as number),
        ...createdTags.map((tag) => tag.id),
      ];

      // Save video details to the database
      console.log(`The bucket name is: ${AWS_S3_BUCKET_NAME}`);
      const videoUrl = `https://${AWS_S3_BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${videoFileKey}`;
      const thumbnailUrl = `https://${AWS_S3_BUCKET_NAME}.s3.ap-northeast-1.amazonaws.com/${thumbnailFileKey}`;
      const duration = await getVideoDuration(videoUrl);

      const video = await saveVideo(
        title,
        description,
        videoUrl,
        thumbnailUrl,
        result.admin.id,
        videoFileKey,
        authToken!,
        duration
      );

      await Promise.all(
        tagIds.map((tagId) => mapVideoToTags(video.id, tagId, authToken!))
      );

      // Show a success message after video is saved successfully in the database
      toast.success("ビデオが正常に保存されました。");

      navigate("/admin/videos");

      // // Optionally log or use the returned video data
      // console.log(video);
      setTitle("");
      setDescription("");
      setVideoFile(undefined);
      setThumbnailFile(undefined);
      setSelectedTags([]);
      titleRef.current!.value = "";
      videoFileRef.current!.value = "";
      thumbnailFileRef.current!.value = "";
    } catch (error) {
      console.error(
        "サーバーへの署名付きURL生成または動画保存に失敗しました。",
        error
      );
      setUploadProgress(null);
      toast.error(
        "アップロードプロセスを完了できませんでした。もう一度試してください。"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container
      title="動画新規登録"
      routes={[
        {
          text: "動画一覧",
          onClick: () => handleVideoListPage(navigate),
        },
        ,
        "動画新規登録",
      ]}
    >
      <div className={style.uploadContainer}>
        <div className="input-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            placeholder="１２分間の全身ストレッチ"
            value={title}
            onChange={handleTitleChange}
            ref={titleRef}
          />
        </div>
        <div className="input-group">
          <label htmlFor="description">動画の説明</label>
          <textarea
            id="description"
            placeholder="説明を入力してください。"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="tags">タグ</label>
          <CreatableSelect
            isMulti
            options={tags}
            value={selectedTags}
            onChange={handleTagChange}
            placeholder="選択してください"
            className={style.custom}
          />
        </div>
        <div className="input-group">
          <label>動画ファイル</label>
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              ref={videoFileRef}
            />
          </div>
        </div>
        <div className="input-group">
          <label>サムネイル画像</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailFileChange}
            ref={thumbnailFileRef}
          />
        </div>
        <button onClick={handleSubmit} disabled={uploading}>
          {uploading ? "処理中" : "作成する"}
        </button>
        {uploadProgress !== null && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default VideoUpload;
