import { useState, useEffect, useRef, useCallback } from "react";
import styles from "../../../Admin/managers/add/add.manager.module.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addTrainer, TrainerData } from "../trainer.api";
import {
  ClientProfileResponse,
  fetchClientProfile,
} from "../../sidebar.client.api";
import { Container } from "../../../components/Container";
import { emailRegex } from "../../../constant";
import { handleTrainerListPage } from "../../../utils.client";

const AddTrainer = () => {
  const [formData, setFormData] = useState<TrainerData>({
    name: "",
    email: "",
    password: "",
    role: "TRAINER",
  });

  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/clients/login"),
    [navigate]
  );
  const hasShownToast = useRef(false);

  useEffect(() => {
    const getFacilityId = async () => {
      const clientauthToken = localStorage.getItem("clientauthToken");
      const clientId = localStorage.getItem("clientId");
      if (clientauthToken) {
        const result: ClientProfileResponse = await fetchClientProfile(
          clientauthToken!,
          parseInt(clientId!, 10)
        );
        if (result.statusCode === 401) {
          if (!hasShownToast.current) {
            toast.error("Token is expired, please log in again.", {
              onClose: navigateToLogin,
            });
            hasShownToast.current = true;
          }
        } else if (result.statusCode == 200) {
          setFormData({
            name: "",
            email: "",
            password: "",
            role: "TRAINER",
          });
        }
      } else {
        toast.error("No auth token found. Please log in.", {
          onClose: navigateToLogin,
        });
      }
    };

    getFacilityId();
  }, [navigateToLogin]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      role: "TRAINER",
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      role: "TRAINER",
    }));
  };

  const handlePasswordConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirmation(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasEmptyField = Object.values(formData).some(
      (value) => typeof value === "string" && value.trim() === ""
    );
    if (hasEmptyField || passwordConfirmation.trim() === "") {
      toast.error("全ての項目を入力してください。");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      toast.error("有効なメールアドレスを入力してください。");
      return;
    }

    if (formData.password !== passwordConfirmation) {
      toast.error("パスワードが一致しません。");
      return;
    }

    const authToken = localStorage.getItem("clientauthToken");
    if (authToken) {
      const result = await addTrainer(formData, authToken);
      if (result.statusCode === 201) {
        toast.success("トレーナーを作成しました。");
        setFormData({
          name: "",
          email: "",
          password: "",

          role: "",
        });
        setPasswordConfirmation("");
        navigate("/clients/trainers");
      } else if (result.statusCode === 409) {
        toast.error("このメールアドレスは既に登録されています。");
      } else {
        toast.error(result.message || "トレーナーの作成に失敗しました。");
      }
    } else {
      toast.error("再度ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="トレーナー新規登録"
      routes={[
        {
          text: "トレーナー一覧",
          onClick: () => handleTrainerListPage(navigate),
        },
        "トレーナー新規登録",
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
          作成する
        </button>
      </form>
    </Container>
  );
};

export default AddTrainer;
