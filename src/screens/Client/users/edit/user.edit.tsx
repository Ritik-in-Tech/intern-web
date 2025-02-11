import { useState, useEffect, useCallback } from "react";
import styles from "./user.edit.module.scss";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { editUser, editUserData, fetchUserById } from "../api.users";
import {
  FunctionalLevelOptions,
  handleUserListPage,
} from "../../../utils.client";
import { Container } from "../../../components/Container";

const EditUserDetails = () => {
  const [formData, setFormData] = useState<editUserData>({
    name: "",
    gender: "",
    dateOfBirth: "",
    medicalRecordId: "",
    functionalLevel: "",
    medicalHistory: "",
  });

  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  useEffect(() => {
    if (!id) {
      setError("利用者IDが指定されていません。");
      return;
    }

    const formatDate = (isoString: string) => {
      const date = new Date(isoString);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start from 0
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const getUserDetails = async () => {
      const clientauthToken = localStorage.getItem("clientauthToken");
      try {
        const userDetail = await fetchUserById(
          clientauthToken!,
          parseInt(id!, 10)
        );
        setFormData({
          name: userDetail.name,
          gender: userDetail.gender,
          dateOfBirth: formatDate(userDetail.dateOfBirth),
          medicalRecordId: userDetail.medicalRecordId,
          functionalLevel: userDetail.functionalLevel,
          medicalHistory: userDetail.medicalHistory,
        });
      } catch (error) {
        console.log(error);
      }
    };
    getUserDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const hasEmptyField = Object.values(formData).some(
      (value) => typeof value === "string" && value.trim() === ""
    );
    if (hasEmptyField) {
      toast.error("全ての項目を入力してください。");
      return;
    }

    if (!formData.gender || formData.gender === "") {
      toast.error("性別を選択してください。");
      return;
    }

    if (!formData.functionalLevel || formData.functionalLevel === "") {
      toast.error("機能レベルを選択してください。");
      return;
    }

    const clientauthToken = localStorage.getItem("clientauthToken");
    if (clientauthToken) {
      const result = await editUser(
        formData,
        clientauthToken,
        parseInt(id!, 10)
      );
      if (result.statusCode === 200) {
        toast.success("利用者の情報を更新しました。");
        navigate("/clients/users");
      } else {
        toast.error(result.message || "利用者の情報の更新に失敗しました。");
      }
    } else {
      toast.error("再度ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="利用者編集"
      routes={[
        {
          text: "利用者一覧",
          onClick: () => handleUserListPage(navigate),
        },
        ,
        "利用者編集",
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
          保存する
        </button>
      </form>
    </Container>
  );
};

export default EditUserDetails;
