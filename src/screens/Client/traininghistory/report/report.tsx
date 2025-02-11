import { useState, useEffect } from "react";
import userstyles from "../../users/users.module.scss";
import reportStyles from "./report.module.scss";
import { fetchReports } from "../api.report";
import { Pagination } from "../../../components/Pagination";
import { getPageNumbers } from "../../../components/Pagination/getpagenumber";
import { useNavigate } from "react-router-dom";
import {
  calculateAge,
  formatDateTime,
  formatDuration,
  formatGender,
  // sortReportsByCreatedAt,
  sortUsersByName,
} from "../../../utils.client";
import { Container } from "../../../components/Container";
import { fetchUsers } from "../../users/api.users";

interface Report {
  id: number;
  createdAt: string;
  totalUniqueUsers: {
    id: number;
    name: string;
    dateOfBirth: string;
    data: {
      physical: number;
      emotional: number;
    };
  }[];
  totalUniqueViewingHistory: {
    contentId: number;
  }[];
  totalVideoDuration: number;
}

interface Users {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  facilityId: number;
}

const Report = () => {
  const [usersReport, setUsersReport] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("workouts");
  const [usersList, setUsersList] = useState<Users[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reportsPerPage = 15;
  const userPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const getReports = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const reports = await fetchReports(authToken!);
        console.log(reports);
        setUsersReport(reports);
      } catch (error) {
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };

    getReports();

    const getUsers = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const users = await fetchUsers(authToken!);

        const sortedUsers = sortUsersByName(users);
        setUsersList(sortedUsers);
      } catch (error) {
        setError("利用者の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const indexOfLastReport = reportsPerPage * currentPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = usersReport.slice(
    indexOfFirstReport,
    indexOfLastReport
  );

  const totalPagesWorkout = Math.ceil(usersReport.length / reportsPerPage);

  const paginateWorkout = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPagesUsers = Math.ceil(usersList.length / userPerPage);

  const indexOfLastUser = currentPage * userPerPage;
  const indexOfFirstUser = indexOfLastUser - userPerPage;
  const currentUsers = usersList.slice(indexOfFirstUser, indexOfLastUser);

  const paginateUser = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDetailClick = (report: Report) => {
    navigate("/clients/training_tracks/history", {
      state: { reportData: report },
    });
  };

  return (
    <Container title="ワークアウト履歴一覧" routes={["ワークアウト履歴一覧"]}>
      <div className={reportStyles.tabContainer}>
        <button
          className={`${reportStyles.tabButton} ${
            selectedTab === "workouts" ? reportStyles.selectedTab : ""
          }`}
          onClick={() => setSelectedTab("workouts")}
        >
          ワークアウト一覧
        </button>
        <button
          className={`${reportStyles.tabButton} ${
            selectedTab === "users" ? reportStyles.selectedTab : ""
          }`}
          onClick={() => setSelectedTab("users")}
        >
          利用者一覧
        </button>
      </div>
      {selectedTab === "workouts" ? (
        <div className={userstyles.tableContainer}>
          <table className={userstyles.table}>
            <thead>
              <tr>
                <th>実施日時</th>
                <th>参加者</th>
                <th>視聴した動画</th>
                <th>合計ワークアウト時間</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report) => (
                <tr
                  key={report.id}
                  className={userstyles.rowButton}
                  onClick={() => handleDetailClick(report)}
                >
                  <td> {formatDateTime(report.createdAt)}</td>
                  <td>{report.totalUniqueUsers.length + "名"}</td>
                  <td>{report.totalUniqueViewingHistory.length + "本"}</td>
                  <td>{formatDuration(report.totalVideoDuration)}</td>
                  <td className={reportStyles.buttonCell}>
                    <button
                      className={userstyles.textButton}
                      onClick={() => handleDetailClick(report)}
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={userstyles.tableContainer}>
          <table className={userstyles.table}>
            <thead>
              <tr>
                <th>氏名</th>
                <th>性別</th>
                <th>年齢</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className={userstyles.rowButton}
                  onClick={() =>
                    navigate(`/clients/training_tracks/userReport/${user.id}`)
                  }
                >
                  <td>{user.name}</td>
                  <td>{formatGender(user.gender)}</td>
                  <td>{calculateAge(user.dateOfBirth)}</td>
                  <td>
                    <button
                      className={userstyles.textButton}
                      onClick={() =>
                        navigate(
                          `/clients/training_tracks/userReport/${user.id}`
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
      )}
      {selectedTab === "workouts" ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPagesWorkout}
          paginate={paginateWorkout}
          getPageNumbers={getPageNumbers}
        />
      ) : (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPagesUsers}
          paginate={paginateUser}
          getPageNumbers={getPageNumbers}
        />
      )}
    </Container>
  );
};

export default Report;
