import { useState, useEffect, useCallback } from "react";
import styles from "../../../Admin/managers/edit/edit.manager.module.scss";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { editTrainer, editTrainerData, fetchTrainerById } from "../trainer.api";
import { Container } from "../../../components/Container";
import { emailRegex } from "../../../constant";
import { handleTrainerListPage } from "../../../utils.client";

const EditTrainerDetails = () => {
  const [formData, setFormData] = useState<editTrainerData>({
    name: "",
    email: "",
    password: "",
  });
  const { id } = useParams<{ id: string }>();
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  useEffect(() => {
    if (!id) {
      setError("No trainer ID provided");
      return;
    }
    const getTrainerDetails = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const trainerDetail = await fetchTrainerById(
          authToken!,
          parseInt(id!, 10)
        );
        setFormData({
          name: trainerDetail.name,
          email: trainerDetail.email,
          password: trainerDetail.password || "",
        });
      } catch (error) {}
    };

    getTrainerDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePasswordConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirmation(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailRegex.test(formData.email)) {
      toast.error(
        "有効なメールアドレスを半角アルファベットで入力してください。"
      );
      return;
    }

    if (formData.password !== passwordConfirmation) {
      toast.error("パスワードが一致しません。");
      return;
    }

    const authToken = localStorage.getItem("clientauthToken");
    if (authToken) {
      const result = await editTrainer(formData, authToken, parseInt(id!, 10));
      if (result.statusCode === 200) {
        toast.success("トレーナーの更新が完了しました。");
        navigate("/clients/trainers");
        setPasswordConfirmation("");
      } else {
        toast.error(result.message || "トレーナーの更新に失敗しました。");
      }
    } else {
      toast.error("再度ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="トレーナー編集"
      routes={[
        {
          text: "トレーナー一覧",
          onClick: () => handleTrainerListPage(navigate),
        },
        ,
        "トレーナー編集",
      ]}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            お名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            placeholder="動木　太郎"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            メールアドレス
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className={styles.input}
            placeholder="ugoness@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            パスワード
          </label>
          <input
            type="text"
            id="password"
            name="password"
            className={styles.input}
            placeholder="XXXXXXXXXX"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="passwordConfirmation" className={styles.label}>
            パスワード（確認）
          </label>
          <input
            type="text"
            id="passwordConfirmation"
            name="passwordConfirmation"
            className={styles.input}
            placeholder="XXXXXXXXXX"
            value={passwordConfirmation}
            onChange={handlePasswordConfirmationChange}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          保存する
        </button>
      </form>
    </Container>
  );
};

export default EditTrainerDetails;
