import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import companyStyle from "../../../Admin/companies/detail/company.detail.module.scss";
import { Container } from "../../../components/Container";
import { fetchUserReports } from "../api.report";
import {
  formatDateTime,
  handleTrainingHistoryListPage,
} from "../../../utils.client";
import { fetchUserById } from "../../users/api.users";
import facilityStyles from "../../../Admin/facilities/facilities.module.scss";
import styles from "./user.report.module.scss";
import PHYSICAL_IMAGE from "../../../../assets/icons/physical.svg";
import EMOTIONAL_IMAGE from "../../../../assets/icons/emotional.svg";
import {
  messagesOfPhysicalStates,
  messagesOfPsychologicalStates,
} from "../showhistory/history.training";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { chartOptions } from "../chart/options";
import { prepareChartData } from "../chart/data";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UserReport {
  id: number;
  createdAt: string;
  data: {
    physical: number;
    emotional: number;
  }[];
  ViewingHistory: {
    contentId: number;
    thumbnailUrl: string;
    title: string;
  }[];
}

const UserReport = () => {
  const [usersReport, setUsersReport] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState<{ name: String }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("利用者IDが指定されていません。");
      return;
    }

    const getReports = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      setLoading(true);
      try {
        const userReports = await fetchUserReports(authToken!, parseInt(id));
        setUsersReport(userReports);
      } catch (error) {
        setError("Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    };
    getReports();

    const getUsers = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      setLoading(true);
      try {
        const users = await fetchUserById(authToken!, parseInt(id));
        setName(users.name);
      } catch (error) {
        setError("利用者の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const chartData = prepareChartData(usersReport);

  const reversedUsersReport = [...usersReport].reverse();

  return (
    <div className={companyStyle.mainContainer}>
      <div className={companyStyle.subContainer}>
        <Container
          title={name + "さんのワークアウト履歴"}
          routes={[
            {
              text: "ワークアウト履歴一覧",
              onClick: () => handleTrainingHistoryListPage(navigate),
            },
            name + "さんのワークアウト履歴",
          ]}
        >
          <div className={styles.chart}>
            <Line options={chartOptions} data={chartData} />
          </div>
        </Container>
      </div>
      <Container>
        <div className={facilityStyles.tableContainer}>
          <table className={facilityStyles.table}>
            <thead>
              <tr>
                <th>日時</th>
                <th>レポート</th>
                <th>視聴した動画</th>
              </tr>
            </thead>
            <tbody>
              {reversedUsersReport.map((user) => (
                <tr key={user.id}>
                  <td className={styles.boldText}>
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td>
                    {user.data.map((data, index) => (
                      <div key={index} className={styles.form}>
                        <div className={styles.row}>
                          <div className={styles.icon}>
                            <img src={PHYSICAL_IMAGE} alt="physical" />
                            <div>身体面</div>
                          </div>
                          <div className={styles.line}></div>
                          <p className={styles.level}>{data.physical}</p>
                          <p className={styles.text}>
                            {messagesOfPhysicalStates[data.physical - 1]}
                          </p>
                        </div>
                        <div className={styles.row}>
                          <div className={styles.icon}>
                            <img src={EMOTIONAL_IMAGE} alt="emotional" />
                            <div>精神面</div>
                          </div>
                          <div className={styles.line}></div>
                          <p className={styles.level}>{data.emotional}</p>
                          <p className={styles.text}>
                            {messagesOfPsychologicalStates[data.emotional - 1]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </td>
                  <td>
                    <div className={styles.videoContainer}>
                      {user.ViewingHistory.map((view, index) => (
                        <div key={index} className={styles.videoRow}>
                          <img
                            src={view.thumbnailUrl}
                            alt={view.title}
                            className={styles.thumbnail}
                          />
                          <p className={styles.videoTitle}>{view.title}</p>
                        </div>
                      ))}
                    </div>
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

export default UserReport;
