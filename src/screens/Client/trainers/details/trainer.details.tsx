import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../../../Admin/managers/details/manager.details.module.scss";
import { deleteTrainer, fetchTrainerById } from "../trainer.api";
import { toast } from "react-toastify";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import {
  logoutAndHeadToClientLogin,
  formatDateTime,
  handleTrainerListPage,
} from "../../../utils.client";

interface Trainer {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const TrainerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("トレーナーIDが指定されていません。");
      return;
    }

    // console.log(id);

    const fetchTrainer = async () => {
      try {
        const authToken = localStorage.getItem("clientauthToken");
        const trainerDetails = await fetchTrainerById(
          authToken!,
          parseInt(id, 10)
        );
        setTrainer(trainerDetails);
      } catch (error) {
        console.error("トレーナーの取得に失敗しました。", error);
        setError("トレーナーの取得に失敗しました。");
      }
    };

    fetchTrainer();
  }, [id]);

  const handleDelete = async () => {
    if (!trainer) return;

    const authToken = localStorage.getItem("clientauthToken");
    if (!authToken) {
      setError("再度ログインしてください。");
      logoutAndHeadToClientLogin(navigate);
      return;
    }

    try {
      const result = await deleteTrainer(authToken, trainer.id);
      if (result.statusCode === 200) {
        toast.success("トレーナーの削除が完了しました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        navigate("/clients/trainers");
      } else {
        setError(result.message || "トレーナーの削除に失敗しました。");
        toast.error(result.message || "トレーナーの削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("トレーナーの削除に失敗しました。", error);
      toast.error("トレーナーの削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("トレーナーの削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("本当に削除しますか？")) {
      handleDelete();
    }
  };

  if (error) {
    return <div>{error}</div>;
  }
  if (!trainer) {
    return <div>Loading...</div>;
  }

  return (
    <Container
      title="トレーナー詳細"
      routes={[
        {
          text: "トレーナー一覧",
          onClick: () => handleTrainerListPage(navigate),
        },
        ,
        "トレーナー詳細",
      ]}
      actionButtons={
        <>
          <Button
            title="編集する"
            style={{ marginRight: "8px" }}
            onClick={() => navigate(`/clients/trainers/${trainer.id}/edit`)}
          />
          <Button title="削除する" onClick={confirmDelete} theme="red" />
        </>
      }
    >
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>お名前</label>
        <div className={styles.detailContent}>{trainer.name}</div>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>メールアドレス</label>
        <div className={styles.detailContent}>{trainer.email}</div>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>登録日時</label>
        <div className={styles.detailContent}>
          {formatDateTime(trainer.createdAt)}
        </div>
      </div>
    </Container>
  );
};

export default TrainerDetailPage;
