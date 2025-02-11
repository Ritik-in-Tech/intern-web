import { useState, useEffect } from "react";
import styles from "../../users/users.module.scss";
import style from "./createreport.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchUserById } from "../../users/api.users";
import {
  calculateAge,
  logoutAndHeadToClientLogin,
} from "../../../utils.client";
import { toast } from "react-toastify";
import { createReport, updateTrainingHistory } from "../training.api";
import PHYSICAL_IMAGE from "../../../../assets/icons/physical.svg";
import EMOTIONAL_IMAGE from "../../../../assets/icons/emotional.svg";
import { svgIcons } from "../../../constant";
import TrainingLayout from "../trainingLayout";

interface User {
  id: number;
  name: string;
  dateOfBirth: string;
}

const CreateReport = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [physicalRatings, setPhysicalRatings] = useState<{
    [key: number]: number;
  }>({});
  const [emotionalRatings, setEmotionalRatings] = useState<{
    [key: number]: number;
  }>({});

  const location = useLocation();
  const { trainingHistoryId } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userIds = searchParams.get("users")?.split(",").map(Number) || [];

    const fetchUserDetails = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      if (!authToken) {
        console.error("再度ログインしてください。");
        logoutAndHeadToClientLogin(navigate);
        return;
      }

      try {
        const userPromises = userIds.map((id) => fetchUserById(authToken, id));
        const users = await Promise.all(userPromises);
        setSelectedUsers(users);
      } catch (error) {
        console.error("ユーザーの取得に失敗しました。", error);
      }
    };

    if (userIds.length > 0) {
      fetchUserDetails();
    }
  }, [location.search]);

  const handleRatingClick = (
    userId: number,
    type: "physical" | "emotional",
    rating: number
  ) => {
    if (type === "physical") {
      setPhysicalRatings((prev) => ({ ...prev, [userId]: rating }));
    } else {
      setEmotionalRatings((prev) => ({ ...prev, [userId]: rating }));
    }
  };

  const handleSubmit = async () => {
    const authToken = localStorage.getItem("clientauthToken");
    if (!authToken) {
      console.error("再度ログインしてください。");
      toast.error("再度ログインしてください。");
      logoutAndHeadToClientLogin(navigate);
      return;
    }

    const incompleteUsers = selectedUsers.filter(
      (user) => !(physicalRatings[user.id] && emotionalRatings[user.id])
    );

    if (incompleteUsers.length > 0) {
      const incompleteNames = incompleteUsers
        .map((user) => user.name)
        .join(", ");
      toast.error(`評価を選択していない利用者がいます: ${incompleteNames}`);
      return;
    }

    const reports = selectedUsers.map((user) => ({
      userId: user.id,
      data: {
        physical: physicalRatings[user.id],
        emotional: emotionalRatings[user.id],
      },
    }));

    try {
      const reportIds: number[] = [];

      for (const report of reports) {
        const reportResponse = await createReport(
          report,
          trainingHistoryId,
          authToken
        );
        if (reportResponse.id) {
          reportIds.push(reportResponse.id);
        }
      }

      console.log("Created Report IDs:", reportIds);

      const updateData = {
        physicalConditionFormIds: reportIds,
      };

      const updatedTrainingHistory = await updateTrainingHistory(
        trainingHistoryId,
        updateData,
        authToken
      );

      console.log("Updated Training History:", updatedTrainingHistory);

      toast.success("レポートが正常に作成されました。");
      setTimeout(() => {
        navigate("/clients");
      }, 1000);
    } catch (error) {
      console.error("Error updating training history:", error);
      toast.error("レポートの送信に失敗しました。");
    }
  };

  const RatingCircles = ({
    userId,
    type,
  }: {
    userId: number;
    type: "physical" | "emotional";
  }) => {
    const ratings = type === "physical" ? physicalRatings : emotionalRatings;
    return (
      <div className={style.ratingContainer}>
        <div className={style.ratingLabel} data-rating="bad">
          <img src={svgIcons.red.inactive} alt="bad" />
          <div>悪い</div>
        </div>
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className={`${style.ratingCircle} ${
              ratings[userId] === index + 1 ? style.selected : ""
            }`}
            onClick={() => handleRatingClick(userId, type, index + 1)}
            data-value={index + 1}
          >
            {index + 1}
          </div>
        ))}
        <div className={style.ratingLabel} data-rating="good">
          <img src={svgIcons.green.inactive} alt="good" />
          <div>良い</div>
        </div>
      </div>
    );
  };

  return (
    <TrainingLayout>
      <div className={style.container}>
        <h3 className={style.title}>ワークアウト後の変化はいかがですか？</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>氏名</th>
                <th>年齢</th>
                <th>ワークアウト後の変化について</th>
              </tr>
            </thead>
            <tbody>
              {selectedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{calculateAge(user.dateOfBirth)}</td>
                  <td>
                    <div className={style.changesContainer}>
                      <div className={style.aspectRow}>
                        <div className={style.aspectLabel}>
                          <img src={PHYSICAL_IMAGE} alt="physical" />
                          <div>身体面</div>
                        </div>
                        <RatingCircles userId={user.id} type="physical" />
                      </div>
                      <div className={style.aspectRow}>
                        <div className={style.aspectLabel}>
                          <img src={EMOTIONAL_IMAGE} alt="emotional" />
                          <div>精神面</div>
                        </div>
                        <RatingCircles userId={user.id} type="emotional" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={style.buttonContainer}>
          <button className={style.submitButton} onClick={handleSubmit}>
            ワークアウトを終了する
          </button>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default CreateReport;
