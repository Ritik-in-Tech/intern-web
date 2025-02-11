import { useNavigate } from "react-router-dom";
import { logoutAndHeadToClientLogin } from "../../utils.client";
import styles from "./NotFound.module.scss";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.notFound}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.subTitle}>
        恐れ入りますが、お探しのページは見つかりませんでした。
      </p>
      <button
        className={styles.backButton}
        onClick={() => {
          logoutAndHeadToClientLogin(navigate);
        }}
      >
        トップに戻る
      </button>
    </div>
  );
};

export default NotFound;
