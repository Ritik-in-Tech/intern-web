import { useState, useEffect, useCallback } from "react";
import styles from "./edit.facilities.module.scss";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  editFacility,
  editFacilityData,
  fetchFacilityById,
} from "../api.facilities";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import { contactNumberRegex, emailRegex } from "../../../constant";
import { fetchCompanyById } from "../../companies/api.companies";
import { handleCompanyDetails, handleMainPage } from "../../../utils.client";

interface Company {
  id: number;
  name: string;
}

const EditFacility = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { companyId } = location.state || {};
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState(null);
  const [formData, setFormData] = useState<editFacilityData>({
    name: "",
    location: "",
    phoneNumber: "",
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
    const authToken = localStorage.getItem("authToken");
    const fetchFacility = async () => {
      try {
        const facilityDetails = await fetchFacilityById(
          authToken!,
          parseInt(id, 10)
        );
        setFormData(facilityDetails);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
        setError("施設の取得に失敗しました。");
      }
    };
    fetchFacility();

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

    // if (!emailRegex.test(formData.personInChargeEmail)) {
    //   toast.error(
    //     "有効なメールアドレスを半角アルファベットで入力してください。"
    //   );
    //   return;
    // }

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const result = await editFacility(formData, authToken, parseInt(id!, 10));
      if (result.statusCode === 200) {
        toast.success("施設の編集に成功しました。");
        navigate(`/admin/companies/${companyId}`);
      } else {
        toast.error(result.message || "施設の編集に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="施設編集"
      routes={[
        {
          text: "企業一覧",
          onClick: () => handleMainPage(navigate),
        },
        {
          text: companyName!,
          onClick: () => handleCompanyDetails(navigate, companyId),
        },
        "施設編集",
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
        <Button title="保存する" type="submit" />
      </form>
    </Container>
  );
};

export default EditFacility;
