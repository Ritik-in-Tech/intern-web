import { useState, useEffect, useCallback } from "react";
import styles from "../../facilities/edit/edit.facilities.module.scss";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import {
  editCompany,
  editCompanyData,
  fetchCompanyById,
} from "../api.companies";
import { handleMainPage } from "../../../utils.client";

const EditCompany = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<editCompanyData>({
    name: "",
    // nameKana: "",
    location: "",
    phoneNumber: "",
    // faxNumber: "",
    // personInChargeName: "",
    // personInChargeNameKana: "",
  });
  const [error, setError] = useState<string | null>(null);
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  useEffect(() => {
    if (!id) {
      setError("施設IDが指定されていません。");
      return;
    }

    const fetchCompany = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const companyDetails = await fetchCompanyById(
          authToken!,
          parseInt(id, 10)
        );
        setFormData(companyDetails);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
        setError("施設の取得に失敗しました。");
      }
    };

    fetchCompany();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }
  if (!formData) {
    return <div>Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const result = await editCompany(formData, authToken, parseInt(id!, 10));
      if (result.statusCode === 200) {
        toast.success("会社の詳細が正常に編集されました。");
        navigate(`/admin/companies/${id}`);
      } else {
        toast.error(result.message || "会社の編集に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="企業編集"
      routes={[
        {
          text: "企業一覧",
          onClick: () => handleMainPage(navigate),
        },
        ,
        "企業編集",
      ]}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            企業名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            placeholder="うごきケア株式会社"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        {/* <div className={styles.formGroup}>
          <label htmlFor="nameKana" className={styles.label}>
            企業名（ふりがな）
          </label>
          <input
            type="text"
            id="nameKana"
            name="nameKana"
            className={styles.input}
            placeholder="うごきけあかぶしきがいしゃ"
            value={formData.nameKana}
            onChange={handleChange}
          />
        </div> */}
        <div className={styles.formGroup}>
          <label htmlFor="location" className={styles.label}>
            企業所在地
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className={styles.input}
            placeholder="〇〇県〇〇市〇〇町 XX-XXX"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            企業電話番号
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            className={styles.input}
            placeholder="000-0000-0000"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        {/* <div className={styles.formGroup}>
          <label htmlFor="faxNumber" className={styles.label}>
            企業ファックス番号
          </label>
          <input
            type="text"
            id="faxNumber"
            name="faxNumber"
            className={styles.input}
            placeholder="000-0000-0000"
            value={formData.faxNumber}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="managerName" className={styles.label}>
            担当者名
          </label>
          <input
            type="text"
            id="managerName"
            name="personInChargeName"
            className={styles.input}
            placeholder="動木　太郎"
            value={formData.personInChargeName}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="personInChargeNameKana" className={styles.label}>
            担当者名（ふりがな）
          </label>
          <input
            type="text"
            id="personInChargeNameKana"
            name="personInChargeNameKana"
            className={styles.input}
            placeholder="うごき　たろう"
            value={formData.personInChargeNameKana}
            onChange={handleChange}
          />
        </div> */}
        <Button title="保存する" type="submit" />
      </form>
    </Container>
  );
};

export default EditCompany;
