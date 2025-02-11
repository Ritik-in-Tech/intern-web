import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./user.details.module.scss";
import { deleteUser, fetchUserById } from "../api.users";
import {
  calculateAge,
  formatDateOfBirth,
  formatDateTime,
  formatFunctionalLevel,
  formatGender,
  handleUserListPage,
  logoutAndHeadToClientLogin,
} from "../../../utils.client";
import { toast } from "react-toastify";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";

interface User {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  medicalRecordId: string;
  functionalLevel: string;
  medicalHistory?: string;
}

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("利用者IDが指定されていません。");
      return;
    }

    const fetchUser = async () => {
      try {
        const clientauthToken = localStorage.getItem("clientauthToken");
        const UserDetails = await fetchUserById(
          clientauthToken!,
          parseInt(id, 10)
        );
        setUser(UserDetails);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("利用者の情報の取得に失敗しました。");
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!user) return;

    const authToken = localStorage.getItem("clientauthToken");
    if (!authToken) {
      setError("再度ログインしてください。");
      logoutAndHeadToClientLogin(navigate);
      return;
    }

    try {
      const result = await deleteUser(authToken, user.id);
      if (result.statusCode === 200) {
        toast.success("利用者を削除しました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        navigate("/clients/users");
      } else {
        setError(result.message || "利用者の削除に失敗しました。");
        toast.error(result.message || "利用者の削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error("利用者の削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("利用者の削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("利用者を削除しますか？")) {
      handleDelete();
    }
  };

  if (error) {
    return <div>{error}</div>;
  }
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Container
        title="利用者詳細"
        routes={[
          {
            text: "利用者一覧",
            onClick: () => handleUserListPage(navigate),
          },
          ,
          "利用者詳細",
        ]}
        actionButtons={
          <>
            <Button
              title="ワークアウト履歴"
              style={{ marginRight: "8px" }}
              onClick={() =>
                navigate(`/clients/training_tracks/userReport/${user.id}`)
              }
              theme="blue"
            />
            <Button
              title="編集する"
              style={{ marginRight: "8px" }}
              onClick={() => navigate(`/clients/users/${user.id}/edit`)}
            />
            <Button title="削除する" onClick={confirmDelete} theme="red" />
          </>
        }
      >
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>お名前</label>
          <div className={styles.detailContent}>{user.name}</div>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>カルテID</label>
          <div className={styles.detailContent}>{user.medicalRecordId}</div>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>性別</label>
          <div className={styles.detailContent}>
            {formatGender(user.gender)}
          </div>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>生年月日</label>
          <div className={styles.detailContent}>
            {formatDateOfBirth(user.dateOfBirth)}
            <span className={styles.age}>
              （{calculateAge(user.dateOfBirth)}歳）
            </span>
          </div>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>機能レベル</label>
          <div className={styles.detailContent}>
            {formatFunctionalLevel(user.functionalLevel)}
          </div>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>登録日時</label>
          <div className={styles.detailContent}>
            {formatDateTime(user.createdAt)}
          </div>
        </div>
      </Container>
      <div className={styles.medicalHistory}>
        <div className={styles.detailItem}>
          <label className={styles.detailLabel}>既往歴</label>
          <div className={styles.medicaldetailContent}>
            {user.medicalHistory}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
