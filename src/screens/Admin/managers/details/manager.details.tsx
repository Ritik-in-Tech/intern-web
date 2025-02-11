import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./manager.details.module.scss";
import { deleteManager, fetchManagerById } from "../api.manager";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import {
  logoutAndHeadToAdminLogin,
  formatDateTime,
  handleMainPage,
} from "../../../utils.client";
import { fetchFacilityById } from "../../facilities/api.facilities";
import { fetchCompanyById } from "../../companies/api.companies";

interface Manager {
  id: number;
  name: string;
  password: string;
  email: string;
  facility: {
    name: string;
    id: number;
  };
  createdAt: string;
}

const ManagerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [manager, setManager] = useState<Manager | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState(null);
  const [facilityName, setFacilityName] = useState(null);
  const location = useLocation();
  const { companyId, facilityId } = location.state || {};
  useEffect(() => {
    if (!id) {
      setError("施設管理者IDが指定されていません。");
      return;
    }
    const authToken = localStorage.getItem("authToken");

    const fetchManager = async () => {
      try {
        const ManagerDetails = await fetchManagerById(
          authToken!,
          parseInt(id, 10)
        );
        setManager(ManagerDetails);
      } catch (error) {
        console.error("施設管理者の取得に失敗しました。");
        setError("施設管理者の取得に失敗しました。");
      }
    };

    fetchManager();

    const getFacilities = async () => {
      try {
        const facilitiesData = await fetchFacilityById(
          authToken!,
          parseInt(facilityId, 10)
        );
        setFacilityName(facilitiesData.name);
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

  const handleDelete = async () => {
    if (!manager) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("再度ログインしてください。");
      logoutAndHeadToAdminLogin(navigate);
      return;
    }

    try {
      const result = await deleteManager(authToken, manager.id);
      if (result.statusCode === 200) {
        toast.success("施設管理者の削除に成功しました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        navigate(`/admin/companies/${companyId}/facilities/${facilityId}`);
      } else {
        setError(result.message || "施設管理者の削除に失敗しました。");
        toast.error(result.message || "施設管理者の削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("施設管理者の削除に失敗しました。");
      toast.error("施設管理者の削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("施設管理者の削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("施設管理者を削除しますか？")) {
      handleDelete();
    }
  };

  if (error) {
    return <div>{error}</div>;
  }
  if (!manager) {
    return <div>Loading...</div>;
  }

  const handleCompanyDetails = () => {
    navigate(`/admin/companies/${companyId}`);
  };

  const handleFacilityDetails = () => {
    navigate(`/admin/companies/${companyId}/facilities/${facilityId}`, {
      state: {
        companyId: companyId,
      },
    });
  };

  return (
    <Container
      title="施設管理者詳細"
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
        "施設管理者詳細",
      ]}
      actionButtons={
        <>
          <Button
            title="編集する"
            style={{ marginRight: "8px" }}
            onClick={() =>
              navigate(
                `/admin/companies/${companyId}/facilities/${facilityId}/managers/${manager.id}/edit`,
                {
                  state: {
                    companyId: companyId,
                    facilityId: facilityId,
                  },
                }
              )
            }
          />
          <Button title="削除する" theme="red" onClick={confirmDelete} />
        </>
      }
    >
      {/* <div className={styles.detailItem}>
        <label className={styles.detailLabel}>所属施設</label>
        <div className={styles.detailContent}>{manager.facility.name}</div>
      </div> */}
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>お名前</label>
        <div className={styles.detailContent}>{manager.name}</div>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>メールアドレス</label>
        <div className={styles.detailContent}>{manager.email}</div>
      </div>
      <div className={styles.detailItem}>
        <label className={styles.detailLabel}>登録日時</label>
        <div className={styles.detailContent}>
          {formatDateTime(manager.createdAt)}
        </div>
      </div>
    </Container>
  );
};

export default ManagerDetailPage;
