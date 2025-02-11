import { useState, useCallback } from "react";
import styles from "../../facilities/add/add.facilities.module.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import { addCompany, CompanyData } from "../api.companies";
import { AdminProfileResponse, fetchAdminProfile } from "../../api.sidebar";
import { logoutAndHeadToAdminLogin } from "../../../utils.client";

const AddCompany = () => {
  const [formData, setFormData] = useState<CompanyData>({
    name: "",
    // nameKana: "",
    location: "",
    // faxNumber: "",
    phoneNumber: "",
    // personInChargeName: "",
    // personInChargeNameKana: "",
    adminId: 1,
  });
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    const hasEmptyField = Object.entries(formData).some(
      ([key, value]) =>
        key !== "faxNumber" && typeof value === "string" && value.trim() === ""
    );
    if (hasEmptyField) {
      toast.error("全てのフィールドを入力してください。");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const adminUser: AdminProfileResponse = await fetchAdminProfile(
        authToken
      );

      if (adminUser.error) {
        if (adminUser.error.includes("Token")) {
          toast.error("再度ログインしてください。");
          logoutAndHeadToAdminLogin(navigate);
        } else {
          toast.error(
            "プロフィールの取得に失敗しました。後で再度お試しください。"
          );
        }
        return;
      }
      const payload = { ...formData, adminId: adminUser.admin.id };
      const result = await addCompany(payload, authToken);
      if (result.statusCode === 201) {
        toast.success("施設の作成に成功しました。");
        setFormData({
          name: "",
          // nameKana: "",
          location: "",
          // faxNumber: "",
          phoneNumber: "",
          // personInChargeName: "",
          // personInChargeNameKana: "",
          adminId: adminUser.admin.id,
        });
        navigate("/admin/companies");
      } else {
        toast.error(result.message || "施設の作成に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container title="企業新規登録" routes={["企業一覧", "企業新規登録"]}>
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
        </div> */}
        {/* <div className={styles.formGroup}>
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
        </div> */}
        {/* <div className={styles.formGroup}>
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
        <Button title="作成する" type="submit" />
      </form>
    </Container>
  );
};

export default AddCompany;
