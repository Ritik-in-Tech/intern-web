import { useState, useEffect } from "react";
import styles from "../../facilities/facilities.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchFacilityByCompanyId } from "../../facilities/api.facilities";
import { useNavigate, useParams } from "react-router-dom";
import {
  handleMainPage,
  logoutAndHeadToAdminLogin,
} from "../../../utils.client";
import { Button } from "../../../components/Button";
import { deleteCompany, fetchCompanyById } from "../api.companies";
import { Container } from "../../../components/Container";
import style from "./company.detail.module.scss";
import detailStyles from "../../facilities/details/facilities.details.module.scss";
import { toast } from "react-toastify";
import StatisticsBar from "../../../components/Stats";

interface Facility {
  id: number;
  name: string;
  location: string;
  createdAt: string;
  numberOfClients: number;
  numberOfUsers: number;
  numberOfTrainingHistories: number;
}

interface Company {
  id: number;
  name: string;
  // nameKana: string;
  location: string;
  phoneNumber: string;
  // faxNumber: string;
  // personInChargeName: string;
  // personInChargeNameKana: string;
  numberOfFacilities: number;
  numberOfClients: number;
  numberOfUsers: number;
  numberOfTrainingHistories: number;
}

const CompanyDetails = () => {
  const [companyDetails, setCompanyDetails] = useState<Company>();
  const [facilityList, setFacilityList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const facilityPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (!id) {
      setError("施設IDが指定されていません。");
      return;
    }
    const authToken = localStorage.getItem("authToken");
    const fetchCompany = async () => {
      try {
        const companyDetails = await fetchCompanyById(
          authToken!,
          parseInt(id, 10)
        );
        setCompanyDetails(companyDetails);
      } catch (error) {
        console.error("施設の取得に失敗しました。");
        setError("施設の取得に失敗しました。");
      }
    };

    fetchCompany();
    const getFacilities = async () => {
      try {
        const facilities = await fetchFacilityByCompanyId(
          authToken!,
          parseInt(id, 10)
        );
        setFacilityList(facilities);
      } catch (error) {
        setError("Failed to fetch facilities");
      } finally {
        setLoading(false);
      }
    };

    getFacilities();
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredFacility = facilityList.filter((facility) =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const totalPages = Math.ceil(filteredFacility.length / facilityPerPage);

  // const indexOfLastFacility = currentPage * facilityPerPage;
  // const indexOfFirstFacility = indexOfLastFacility - facilityPerPage;
  // const currentFacility = filteredFacility.slice(
  //   indexOfFirstFacility,
  //   indexOfLastFacility
  // );

  const handleDelete = async () => {
    if (!companyDetails) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("ログインしてください。");
      logoutAndHeadToAdminLogin(navigate);
      return;
    }

    try {
      const result = await deleteCompany(authToken, parseInt(id!));
      if (result.statusCode === 200) {
        toast.success("会社は正常に削除されました。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate(`/admin/companies`);
      } else {
        setError(result.message || "会社の削除に失敗しました。");
        toast.error(result.message || "会社の削除に失敗しました。", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("会社の削除に失敗しました。");
      toast.error("会社の削除に失敗しました。", {
        position: "top-center",
        autoClose: 3000,
      });
      setError("会社の削除に失敗しました。");
    }
  };

  const confirmDelete = () => {
    if (window.confirm("施設を削除しますか？")) {
      handleDelete();
    }
  };

  // const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const statisticsData = [
    { label: "合計施設数", value: `${companyDetails?.numberOfFacilities}件` },
    { label: "合計管理者数", value: `${companyDetails?.numberOfClients}名` },
    { label: "合計利用者数", value: `${companyDetails?.numberOfUsers}名` },
    {
      label: "合計ワークアウト数",
      value: `${companyDetails?.numberOfTrainingHistories}回`,
    },
  ];

  return (
    <div className={style.mainContainer}>
      <div className={style.subContainer}>
        <Container
          title={companyDetails ? companyDetails.name : ""}
          // subtitle={companyDetails ? companyDetails.nameKana : undefined}
          routes={[
            {
              text: "企業一覧",
              onClick: () => handleMainPage(navigate),
            },
            companyDetails ? companyDetails.name : "",
          ]}
          actionButtons={
            <>
              <Button
                title="編集する"
                style={{ marginRight: "8px" }}
                onClick={() => navigate(`/admin/companies/${id}/edit`)}
              />
              <Button title="削除する" theme="red" onClick={confirmDelete} />
            </>
          }
        >
          <div>
            <StatisticsBar stats={statisticsData} />
          </div>
          {/* <div className={detailStyles.detailItem}>
            <label className={detailStyles.detailLabel}>担当者名</label>
            <div className={detailStyles.detailContent}>
              {companyDetails?.personInChargeName} (
              {companyDetails?.personInChargeNameKana})
            </div>
          </div> */}

          <div className={detailStyles.detailItem}>
            <label className={detailStyles.detailLabel}>企業所在地</label>
            <div className={detailStyles.detailContent}>
              {companyDetails?.location}
            </div>
          </div>

          <div className={detailStyles.detailItem}>
            <label className={detailStyles.detailLabel}>TEL</label>
            <div className={detailStyles.detailContent}>
              {companyDetails?.phoneNumber}
              {/* {companyDetails?.faxNumber && ` (${companyDetails?.faxNumber})`} */}
            </div>
          </div>
        </Container>
      </div>

      <Container
        title={
          "関連施設一覧" +
          " " +
          "(" +
          companyDetails?.numberOfFacilities.toString() +
          "件" +
          ")"
        }
        actionButtons={
          <Button
            title="＋ 新規登録"
            onClick={() => navigate(`/admin/companies/${id}/facilities/new`)}
          />
        }
      >
        <div className={styles.tableContainer}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="検索..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>施設名</th>
                <th>所在地</th>
                <th>管理者数</th>
                <th>利用者数</th>
                <th>ワークアウト</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFacility.map((facility) => (
                <tr
                  key={facility.id}
                  onClick={() =>
                    navigate(
                      `/admin/companies/${id}/facilities/${facility.id}`,
                      {
                        state: {
                          companyId: id,
                        },
                      }
                    )
                  }
                  className={styles.rowButon}
                >
                  <td>{facility.name}</td>
                  <td>{facility.location}</td>
                  <td>{facility.numberOfClients}</td>
                  <td>{facility.numberOfUsers}</td>
                  <td>{facility.numberOfTrainingHistories}</td>
                  <td>
                    <button
                      className={styles.textButton}
                      onClick={() =>
                        navigate(
                          `/admin/companies/${id}/facilities/${facility.id}`,
                          {
                            state: {
                              companyId: id,
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

export default CompanyDetails;
