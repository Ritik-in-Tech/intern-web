import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./facilities.details.module.scss";
import { deleteFacilty, fetchFacilityById } from "../api.facilities";
import { toast } from "react-toastify";
import { Container } from "../../../components/Container";
import { Button } from "../../../components/Button";
import {
  logoutAndHeadToAdminLogin,
  formatDateTime,
  handleMainPage,
  handleCompanyDetails,
} from "../../../utils.client";
import { fetchCompanyById } from "../../companies/api.companies";
import style from "../../companies/detail/company.detail.module.scss";
import { FaSearch } from "react-icons/fa";
import managerStyles from "../../managers/managers.module.scss";
import { fetchManagerByFacilityId } from "../../managers/api.manager";
import StatisticsBar from "../../../components/Stats";

interface facility {
  id: number;
  name: string;
  location: string;
  phoneNumber: string;
  personInChargeName: string;
  personInChargeEmail: string;
  adminId: number;
  createdAt: string;
  numberOfClients: number;
  numberOfUsers: number;
  numberOfTrainingHistories: number;
}

interface Company {
  id: number;
  name: string;
}

interface Manager {
  id: number;
  name: string;
  facility: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const FacilityDetailPage = () => {
  const [managerList, setManagerList] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const managerPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<facility | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { companyId } = location.state || {};
  const [companyName, setCompanyName] = useState(null);
  const [facilityName, setFacilityName] = useState<string | null>(null);

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
        setFacility(facilityDetails);
        setFacilityName(facilityDetails.name);
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
          parseInt(companyId, 10)
        );
        setCompanyName(companyDetails.name);
        console.log(companyDetails.name);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
      }
    };

    fetchCompany();

    const getManagers = async () => {
      try {
        const managers = await fetchManagerByFacilityId(
          authToken!,
          parseInt(id)
        );
        console.log(managers);
        setManagerList(managers);
      } catch (error) {
        setError("施設管理者の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getManagers();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async () => {
    if (!facility) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("ログインしてください。");
      logoutAndHeadToAdminLogin(navigate);
      return;
    }

    try {
      const result = await deleteFacilty(authToken, facility.id);
      if (result.statusCode === 200) {
        toast.success("施設の削除に成功しました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate(`/admin/companies/${companyId}`);
      } else {
        setError(result.message || "施設の削除に失敗しました。");
        toast.error(result.message || "施設の削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("施設の削除に失敗しました。");
      toast.error("施設の削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("施設の削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("施設を削除しますか？")) {
      handleDelete();
    }
  };

  if (error) {
    return <div>{error}</div>;
  }
  if (!facility) {
    return <div>Loading...</div>;
  }

  const filteredManagers = managerList.filter((manager) =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statisticsData = [
    { label: "合計管理者数", value: `${facility?.numberOfClients}名` },
    { label: "合計利用者数", value: `${facility?.numberOfUsers}名` },
    {
      label: "合計ワークアウト数",
      value: `${facility?.numberOfTrainingHistories}回`,
    },
  ];

  return (
    <div className={style.mainContainer}>
      <div className={style.subContainer}>
        <Container
          title={facilityName!}
          routes={[
            {
              text: "企業一覧",
              onClick: () => handleMainPage(navigate),
            },
            {
              text: companyName!,
              onClick: () => handleCompanyDetails(navigate, companyId),
            },
            facilityName!,
          ]}
          actionButtons={
            <>
              <Button
                title="編集する"
                style={{ marginRight: "8px" }}
                onClick={() =>
                  navigate(
                    `/admin/companies/${companyId}/facilities/${facility.id}/edit`,
                    {
                      state: {
                        companyId: companyId,
                      },
                    }
                  )
                }
              />
              <Button title="削除する" theme="red" onClick={confirmDelete} />
            </>
          }
        >
          <div>
            <StatisticsBar stats={statisticsData} />
          </div>
          <div className={styles.detailItem}>
            <label className={styles.detailLabel}>施設所在地</label>
            <div className={styles.detailContent}>{facility.location}</div>
          </div>
          <div className={styles.detailItem}>
            <label className={styles.detailLabel}>施設電話番号</label>
            <div className={styles.detailContent}>{facility.phoneNumber}</div>
          </div>
          {/* <div className={styles.detailItem}>
            <label className={styles.detailLabel}>担当者名</label>
            <div className={styles.detailContent}>
              {facility.personInChargeName}
            </div>
          </div>
          <div className={styles.detailItem}>
            <label className={styles.detailLabel}>担当者メールアドレス</label>
            <div className={styles.detailContent}>
              {facility.personInChargeEmail}
            </div>
          </div> */}
        </Container>
      </div>
      <Container
        title="施設管理者一覧"
        actionButtons={
          <Button
            title="＋ 新規登録"
            onClick={() =>
              navigate(
                `/admin/companies/${companyId}/facilities/${id}/managers/new`,
                {
                  state: {
                    companyId: companyId,
                  },
                }
              )
            }
          />
        }
      >
        <div className={managerStyles.tableContainer}>
          <div className={managerStyles.searchContainer}>
            <FaSearch className={managerStyles.searchIcon} />
            <input
              type="text"
              placeholder="お名前で検索..."
              className={managerStyles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <table className={managerStyles.table}>
            <thead>
              <tr>
                <th>氏名</th>
                {/* <th>所属</th> */}
                <th>作成日時</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.map((manager) => (
                <tr
                  key={manager.id}
                  onClick={() =>
                    navigate(
                      `/admin/companies/${companyId}/facilities/${id}/managers/${manager.id}`,
                      {
                        state: {
                          companyId: companyId,
                          facilityId: id,
                        },
                      }
                    )
                  }
                  className={styles.rowButton}
                >
                  <td>{manager.name}</td>
                  {/* <td>{manager.facility.name}</td> */}
                  <td>{formatDateTime(manager.createdAt)}</td>
                  <td>
                    <button
                      className={managerStyles.textButton}
                      onClick={() =>
                        navigate(
                          `/admin/companies/${companyId}/facilities/${id}/managers/${manager.id}`,
                          {
                            state: {
                              companyId: companyId,
                              facilityId: id,
                            },
                          }
                        )
                      }
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </div>
  );
};

export default FacilityDetailPage;
