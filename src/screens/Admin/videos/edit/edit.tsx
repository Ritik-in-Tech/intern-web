import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  fetchVideoById,
  editVideoApi,
  getAllTags,
  createTag,
  mapVideoToTags,
  deleteVideoTagMapping,
} from "../api.video";
import { toast } from "react-toastify";
import styles from "./edit.module.scss";
import { Container } from "../../../components/Container";
import CreatableSelect from "react-select/creatable";
import { handleVideoListPage } from "../../../utils.client";

const EditVideoDetailsPage = () => {
  const location = useLocation();
  const videoWithTags = location.state?.videoWithTags;
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchAllTags = async () => {
    const authToken = localStorage.getItem("authToken");
    try {
      const tags = await getAllTags(authToken!);
      setAllTags(tags.map((tag: any) => ({ value: tag.id, label: tag.name })));
    } catch (error) {
      console.error("タグの取得に失敗しました。", error);
      toast.error("タグの取得に失敗しました。");
    }
  };

  useEffect(() => {
    if (!id) {
      setError("動画IDが指定されていません。");
      return;
    }

    const fetchVideo = async () => {
      console.log(videoWithTags);
      const authToken = localStorage.getItem("authToken");
      try {
        const videoData = await fetchVideoById(parseInt(id, 10), authToken!);
        setTitle(videoData.title);
        setDescription(videoData.description);

        if (videoWithTags && videoWithTags.tags) {
          setSelectedTags(
            videoWithTags.tags.map((tag: any) => ({
              value: tag.id,
              label: tag.name,
            }))
          );
        }
        await fetchAllTags();
      } catch (error) {
        console.error("動画の取得に失敗しました。", error);
        toast.error("動画の取得に失敗しました。");
        setError("動画の取得に失敗しました。");
      }
    };

    fetchVideo();
  }, [id, videoWithTags]);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
  };

  const handleTagChange = (newValue: any) => {
    setSelectedTags(newValue);
  };

  const getAvailableTags = () => {
    return allTags.filter(
      (tag) =>
        !selectedTags.some((selectedTag) => selectedTag.value === tag.value)
    );
  };

  const updateVideoWithTags = (newTags: any[]) => {
    const currentTagIds = selectedTags.map((tag) => tag.value.toString());
    const updatedTags = [
      ...videoWithTags.tags.filter((tag: any) =>
        currentTagIds.includes(tag.id.toString())
      ),
      ...newTags,
    ];

    // Remove duplicates based on tag id
    const uniqueUpdatedTags = Array.from(
      new Map(updatedTags.map((tag) => [tag.id, tag])).values()
    );

    return {
      ...videoWithTags,
      title,
      description,
      tags: uniqueUpdatedTags,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) {
      setError("動画IDが指定されていません。");
      return;
    }
    const authToken = localStorage.getItem("authToken");

    try {
      await editVideoApi(parseInt(id, 10), authToken!, { title, description });

      let newCreatedTags: any[] = [];

      const newTags = selectedTags.filter(
        (tag) => !tag.value.toString().match(/^\d+$/)
      );
      const existingTags = selectedTags.filter((tag) =>
        tag.value.toString().match(/^\d+$/)
      );

      const previousTagIds = videoWithTags.tags.map((tag: any) => tag.id);
      const currentTagIds = existingTags.map((tag) => tag.value);
      const removedTagIds = previousTagIds.filter(
        (id: number) => !currentTagIds.includes(id)
      );

      for (const removedTagId of removedTagIds) {
        try {
          await deleteVideoTagMapping(
            parseInt(id, 10),
            removedTagId,
            authToken!
          );
        } catch (error) {
          console.error("タグのマッピング削除に失敗しました。", error);
          toast.error(`タグのマッピング削除に失敗しました。`);
        }
      }

      for (const newTag of newTags) {
        try {
          // Create new tag
          const createdTag = await createTag(newTag.label, authToken!);

          // Map new tag to video
          await mapVideoToTags(parseInt(id, 10), createdTag.id, authToken!);

          newCreatedTags.push({ id: createdTag.id, name: createdTag.name });
        } catch (error) {
          console.error(
            "新しいタグの作成またはマッピングに失敗しました。",
            error
          );
          toast.error(
            `タグ "${newTag.label}" の作成またはマッピングに失敗しました。`
          );
        }
      }
      let newlyMappedExistingTags: any[] = [];

      const previousTags = videoWithTags.tags.map((tag: any) => tag.id);
      for (const existingTag of existingTags) {
        if (!previousTags.includes(existingTag.value)) {
          try {
            await mapVideoToTags(
              parseInt(id, 10),
              existingTag.value,
              authToken!
            );

            newlyMappedExistingTags.push({
              id: existingTag.value,
              name: existingTag.label,
            });
          } catch (error) {
            console.error("既存のタグのマッピングに失敗しました。", error);
            toast.error(
              `タグ "${existingTag.label}" のマッピングに失敗しました。`
            );
          }
        }
      }

      const updatedVideoWithTags = updateVideoWithTags([
        ...newCreatedTags,
        ...newlyMappedExistingTags,
      ]);
      toast.success("ビデオの詳細が正常に更新されました。");
      navigate(`/admin/videos/${id}`, {
        state: { videoWithTags: updatedVideoWithTags },
      });
    } catch (error) {
      console.error("動画の更新に失敗しました。", error);
      setError("動画の更新に失敗しました。");
      toast.error("動画の詳細を更新できませんでした。");
    }
  };

  return (
    <Container
      title="動画編集"
      routes={[
        {
          text: "動画一覧",
          onClick: () => handleVideoListPage(navigate),
        },
        ,
        "動画編集",
      ]}
    >
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            動画の説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            className={styles.textarea}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tags">タグ</label>
          <CreatableSelect
            isMulti
            options={getAvailableTags()}
            value={selectedTags}
            onChange={handleTagChange}
            placeholder="選択してください"
            className={styles.custom}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          更新する
        </button>
      </form>
    </Container>
  );
};

export default EditVideoDetailsPage;
