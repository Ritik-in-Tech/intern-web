import { useState, useEffect, useCallback } from "react";
import styles from "./edit.manager.module.scss";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { editManager, editManagerData, fetchManagerById } from "../api.manager";
import {
  fetchFacilities,
  fetchFacilityById,
} from "../../facilities/api.facilities";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import { emailRegex } from "../../../constant";
import { fetchCompanyById } from "../../companies/api.companies";

const EditManagerDetails = () => {
  const [formData, setFormData] = useState<editManagerData>({
    name: "",
    email: "",
    password: "",
    facilityId: 1,
  });
  const { id } = useParams<{ id: string }>();
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  );
  const location = useLocation();
  const { companyId, facilityId } = location.state || {};
  const [companyName, setCompanyName] = useState(null);
  const [facilityName, setFacilityName] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  useEffect(() => {
    if (!id) {
      setError("施設管理者IDが指定されていません。");
      return;
    }
    const authToken = localStorage.getItem("authToken");
    const getFacilities = async () => {
      try {
        const facilitiesData = await fetchFacilityById(
          authToken!,
          parseInt(facilityId, 10)
        );
        setFacilityName(facilitiesData.name);

        setFormData((prevFormData) => ({
          ...prevFormData,
          facilityId: parseInt(id, 10),
        }));
      } catch (error) {
        toast.error("施設の取得に失敗しました。");
      }
    };
    getFacilities();

    const fetchCompany = async () => {
      try {
        const companyDetails = await fetchCompanyById(
          authToken!,
          parseInt(companyId, 10)
        );
        // console.log(companyDetails);
        setCompanyName(companyDetails.name);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
      }
    };

    fetchCompany();

    const getManagerDetails = async () => {
      try {
        const managerDetail = await fetchManagerById(
          authToken!,
          parseInt(id!, 10)
        );
        setFormData({
          name: managerDetail.name,
          email: managerDetail.email,
          password: managerDetail.password || "",
          facilityId: managerDetail.facility.id,
        });
        console.log(setFormData);
      } catch (error) {
        toast.error("施設管理者の取得に失敗しました。");
      }
    };
    getFacilities();
    getManagerDetails();
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
      toast.error("パスワードが一致していません。");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      const result = await editManager(formData, authToken, parseInt(id!, 10));
      if (result.statusCode === 200) {
        toast.success("施設管理者の更新に成功しました。");
        navigate(`/admin/companies/${companyId}/facilities/${id}`, {
          state: {
            companyId: companyId,
          },
        });
        setPasswordConfirmation("");
      } else {
        toast.error(result.message || "施設管理者の更新に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  return (
    <Container
      title="施設管理者編集"
      routes={["企業一覧", companyName!, facilityName!, "施設管理者編集"]}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* <div className={styles.formGroup}>
          <label htmlFor="facilityId" className={styles.label}>
            所属施設
          </label>
          <select
            id="facilityId"
            name="facilityId"
            className={styles.input}
            value={formData.facilityId}
            onChange={handleFacilityChange}
          >
            {facilities.map((facility) => (
              <option
                className={styles.option}
                key={facility.id}
                value={facility.id}
              >
                {facility.name}
              </option>
            ))}
          </select>
        </div> */}
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
        <Button title="作成する" type="submit" />
      </form>
    </Container>
  );
};

export default EditManagerDetails;
