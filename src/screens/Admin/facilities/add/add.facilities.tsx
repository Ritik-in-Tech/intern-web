import { useState, useCallback, useEffect } from "react";
import styles from "./add.facilities.module.scss";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addFacility, FacilityData } from "../api.facilities";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import { contactNumberRegex, emailRegex } from "../../../constant";
import { fetchCompanyById } from "../../companies/api.companies";
import { handleMainPage } from "../../../utils.client";

interface Company {
  id: number;
  name: string;
}

const AddFacility = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FacilityData>({
    name: "",
    location: "",
    phoneNumber: "",
    // personInChargeName: "",
    // personInChargeEmail: "",
    companyId: parseInt(id!),
  });
  const [companyName, setCompanyName] = useState(null);
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );
  useEffect(() => {
    if (!id) {
      return;
    }
    const authToken = localStorage.getItem("authToken");
    const fetchCompany = async () => {
      try {
        const companyDetails = await fetchCompanyById(
          authToken!,
          parseInt(id, 10)
        );
        setCompanyName(companyDetails.name);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
      }
    };

    fetchCompany();
  }, [id]);
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
    const hasEmptyField = Object.values(formData).some(
      (value) => typeof value === "string" && value.trim() === ""
    );
    if (hasEmptyField) {
      toast.error("全てのフィールドを入力してください。");
      return;
    }
    // if (!contactNumberRegex.test(formData.phoneNumber)) {
    //   toast.error("有効な電話番号を入力してください。");
    //   return;
    // }
    // if (!emailRegex.test(formData.personInChargeEmail)) {
    //   toast.error(
    //     "有効なメールアドレスを半角アルファベットで入力してください。"
    //   );
    //   return;
    // }

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const result = await addFacility(formData, authToken);
      if (result.statusCode === 201) {
        toast.success("施設の作成に成功しました。");
        setFormData({
          name: "",
          location: "",
          phoneNumber: "",
          // personInChargeName: "",
          // personInChargeEmail: "",
          companyId: parseInt(id!),
        });
        navigate(`/admin/companies/${id}`);
      } else {
        toast.error(result.message || "施設の作成に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  const handleCompanyDetails = () => {
    navigate(`/admin/companies/${id}`);
  };

  return (
    <Container
      title="施設新規登録"
      routes={[
        {
          text: "企業一覧",
          onClick: () => handleMainPage(navigate),
        },
        {
          text: companyName!,
          onClick: () => handleCompanyDetails(),
        },
        "施設新規登録",
      ]}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            施設名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={styles.input}
            placeholder="あおぱアパートシティ"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="location" className={styles.label}>
            施設所在地
          </label>
          <input
            type="text"
            id="location"
            name="location"
            className={styles.input}
            placeholder="〇〇県〇〇市〇〇××××"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber" className={styles.label}>
            施設電話番号
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
          <label htmlFor="managerName" className={styles.label}>
            担当者名
          </label>
          <input
            type="text"
            id="managerName"
            name="personInChargeName"
            className={styles.input}
            placeholder="山田 太郎"
            value={formData.personInChargeName}
            onChange={handleChange}
          />
        </div> */}
        {/* <div className={styles.formGroup}>
          <label htmlFor="managerEmail" className={styles.label}>
            担当者メールアドレス
          </label>
          <input
            type="text"
            id="managerEmail"
            name="personInChargeEmail"
            className={styles.input}
            placeholder="taro@example.com"
            value={formData.personInChargeEmail}
            onChange={handleChange}
          />
        </div> */}
        <Button title="作成する" type="submit" />
      </form>
    </Container>
  );
};

export default AddFacility;
