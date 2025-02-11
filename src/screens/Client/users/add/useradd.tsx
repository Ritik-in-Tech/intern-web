import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./useradd.module.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserData, addUser } from "../api.users";
import {
  ClientProfileResponse,
  fetchClientProfile,
} from "../../sidebar.client.api";
import { Container } from "../../../components/Container";
import {
  FunctionalLevelOptions,
  handleUserListPage,
} from "../../../utils.client";

const AddUser = () => {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    gender: "",
    dateOfBirth: "",
    medicalRecordId: "",
    functionalLevel: "",
    medicalHistory: "",
  });
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/clients/login"),
    [navigate]
  );
  const hasShownToast = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFacilityId = async () => {
      const clientauthToken = localStorage.getItem("clientauthToken");
      const clientId = localStorage.getItem("clientId");
      if (clientauthToken) {
        const result: ClientProfileResponse = await fetchClientProfile(
          clientauthToken!,
          parseInt(clientId!, 10)
        );
        if (result.statusCode === 401) {
          if (!hasShownToast.current) {
            toast.error("再度ログインしてください。", {
              onClose: navigateToLogin,
            });
            hasShownToast.current = true;
          }
        } else if (result.statusCode == 200) {
          setFormData({
            name: "",
            gender: "",
            dateOfBirth: "",
            medicalRecordId: "",
            functionalLevel: "",
            medicalHistory: "",
          });
        }
      } else {
        toast.error("再度ログインしてください。", {
          onClose: navigateToLogin,
        });
      }
    };

    loadFacilityId();
  }, [navigateToLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || formData.name === "") {
      toast.error("お名前を入力してください。");
      return;
    }

    if (!formData.gender || formData.gender === "") {
      toast.error("性別を選択してください。");
      return;
    }

    if (!formData.dateOfBirth || formData.dateOfBirth === "") {
      toast.error("生年月日を入力してください。");
      return;
    }

    const authToken = localStorage.getItem("clientauthToken");
    if (authToken) {
      const result = await addUser(formData, authToken);
      if (result.statusCode === 201) {
        toast.success("利用者を作成しました。");
        setFormData({
          name: "",
          gender: "",
          dateOfBirth: "",
          medicalRecordId: "",
          functionalLevel: "",
          medicalHistory: "",
        });
        navigate("/clients/users");
      } else {
        toast.error(result.message || "利用者の作成に失敗しました。");
      }
    } else {
      toast.error("再度ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="利用者新規登録"
      routes={[
        {
          text: "利用者一覧",
          onClick: () => handleUserListPage(navigate),
        },
        ,
        "利用者新規登録",
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
          <label htmlFor="medicalRecordId" className={styles.label}>
            カルテID
          </label>
          <input
            type="text"
            id="medicalRecordId"
            name="medicalRecordId"
            className={styles.input}
            placeholder="12345678"
            value={formData.medicalRecordId}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gender" className={styles.label}>
            性別
          </label>
          <select
            id="gender"
            name="gender"
            className={styles.select}
            value={formData.gender}
            onChange={handleSelectChange}
          >
            <option value="">選択してください</option>
            <option value="Male">男性</option>
            <option value="Female">女性</option>
            <option value="Other">その他</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="dateOfBirth" className={styles.label}>
            生年月日
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            className={styles.input}
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="functionalLevel" className={styles.label}>
            機能レベル
          </label>
          <select
            id="functionalLevel"
            name="functionalLevel"
            className={styles.select}
            value={formData.functionalLevel}
            onChange={handleSelectChange}
          >
            {FunctionalLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="medicalHistory" className={styles.label}>
            既往歴
          </label>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            className={styles.textarea}
            value={formData.medicalHistory}
            onChange={handleTextAreaChange}
            rows={4}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          作成する
        </button>
      </form>
    </Container>
  );
};

export default AddUser;
