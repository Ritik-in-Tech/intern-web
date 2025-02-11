import { useEffect, useState, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./sidebar.module.scss";
import { fetchAdminProfile, AdminProfileResponse } from "./api.sidebar";
import { logoutAndHeadToAdminLogin } from "../utils.client";

const Sidebar = () => {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    id: number;
  }>({
    name: "",
    email: "",
    id: 1,
  });
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  const handleLogout = useCallback(() => {
    logoutAndHeadToAdminLogin(navigate);
  }, [navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      const authToken = localStorage.getItem("authToken");
      if (authToken) {
        const result: AdminProfileResponse = await fetchAdminProfile(authToken);
        if (result.statusCode === 401) {
          if (!hasShownToast.current) {
            logoutAndHeadToAdminLogin(navigate);
            hasShownToast.current = true;
          }
        } else if (result.statusCode == 200) {
          setProfile({
            name: result.admin.name,
            email: result.admin.email,
            id: result.admin.id,
          });
        }
      } else {
        logoutAndHeadToAdminLogin(navigate);
      }
    };

    loadProfile();
  }, [navigate]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>UgoNess</h1>
        <p className={styles.subTitle}>運営管理者</p>
      </div>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="/admin/videos"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <i className={`${styles.icon} material-icons`}>videocam</i>
                <span>動画管理</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/admin/companies"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <i className={`${styles.icon} material-icons`}>store</i>
                <span>企業管理</span>
              </NavLink>
            </li>
            {/* <li className={styles.navItem}>
              <NavLink
                to="/admin/managers"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <i className={`${styles.icon} material-icons`}>person</i>
                <span>施設管理者管理</span>
              </NavLink>
            </li> */}
            <li className={styles.navItem}>
              <NavLink
                to="/admin/login"
                onClick={handleLogout}
                className={styles.navLink}
              >
                <i className={`${styles.icon} material-icons`}>exit_to_app</i>
                <span>ログアウト</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <div className={styles.profileContainer}>
              <p className={styles.profileName}>{profile.name}</p>
            </div>
            <div className={styles.roleContainer}>
              <p className={styles.role}>運営管理者</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
