import { useState, useEffect, useCallback } from "react";
import styles from "./add.manager.module.scss";
import { toast } from "react-toastify";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { addManager, ManagerData } from "../api.manager";
import {
  fetchFacilities,
  fetchFacilityById,
} from "../../facilities/api.facilities";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import { emailRegex } from "../../../constant";
import { fetchCompanyById } from "../../companies/api.companies";
import { handleMainPage } from "../../../utils.client";

const AddManager = () => {
  const [formData, setFormData] = useState<ManagerData>({
    name: "",
    email: "",
    password: "",
    facilityId: 0,
    role: "MANAGER",
  });
  const location = useLocation();
  const { companyId } = location.state || {};
  const [companyName, setCompanyName] = useState(null);
  const [facilityName, setFacilityName] = useState(null);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  );
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const navigateToLogin = useCallback(
    () => navigate("/admin/login"),
    [navigate]
  );

  // Fetch facilities on component mount
  useEffect(() => {
    if (!id) {
      return;
    }
    const authToken = localStorage.getItem("authToken");
    const getFacilities = async () => {
      try {
        const facilitiesData = await fetchFacilityById(
          authToken!,
          parseInt(id, 10)
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
        console.log(companyDetails);
        setCompanyName(companyDetails.name);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
      }
    };

    fetchCompany();
  }, [id]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      role: "MANAGER",
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      role: "MANAGER",
    }));
  };

  const handlePasswordConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordConfirmation(e.target.value);
  };

  // const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedFacilityId = Number(e.target.value);
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     facilityId: selectedFacilityId,
  //     role: "MANAGER",
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.facilityId === 0) {
      toast.error("施設が指定されていません。");
      return;
    }

    const hasEmptyField = Object.values(formData).some(
      (value) => typeof value === "string" && value.trim() === ""
    );
    if (hasEmptyField || passwordConfirmation.trim() === "") {
      toast.error("全てのフィールドに入力してください。");
      return;
    }

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
      const result = await addManager(formData, authToken);
      if (result.statusCode === 201) {
        toast.success("施設管理者の作成に成功しました。");
        // Reset form data
        setFormData({
          name: "",
          email: "",
          password: "",
          facilityId: facilities.length > 0 ? facilities[0].id : 1,
          role: "",
        });
        setPasswordConfirmation("");
        navigate(`/admin/companies/${companyId}/facilities/${id}`, {
          state: {
            companyId: companyId,
          },
        });
      } else if (result.statusCode == 409) {
        toast.error(result.message || "メールアドレスが既に使用されています。");
      } else {
        toast.error(result.message || "施設管理者の作成に失敗しました。");
      }
    } else {
      toast.error("ログインしてください。", {
        onClose: navigateToLogin,
      });
    }
  };

  const handleCompanyDetails = () => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleFacilityDetails = () => {
    navigate(`/admin/companies/${companyId}/facilities/${id}`, {
      state: {
        companyId: companyId,
      },
    });
  };

  return (
    <Container
      title="施設管理者新規登録"
      routes={[
        {
          text: "企業一覧",
          onClick: () => handleMainPage(navigate),
        },
        {
          text: companyName!,
          onClick: () => handleCompanyDetails(),
        },
        {
          text: facilityName!,
          onClick: () => handleFacilityDetails(),
        },
        "施設管理者新規登録",
      ]}
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
            <option value={0}>Choose facility</option>
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

export default AddManager;
