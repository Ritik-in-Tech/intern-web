import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  ClientProfileResponse,
  fetchClientProfile,
} from "./sidebar.client.api";
import styles from "./sidebar.client.module.scss";
import { logoutAndHeadToClientLogin } from "../utils.client";
import { fetchFacilityById } from "../Admin/facilities/api.facilities";
import { fetchCompanyById } from "../Admin/companies/api.companies";
import FacilityIcon from "../../assets/icons/facility_icon.svg";
import CompanyIcon from "../../assets/icons/company_icon.svg";

const ClientSideBar = () => {
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    role: string;
    facilityName: string;
    companyName: string;
  }>({
    name: "",
    email: "",
    role: "",
    facilityName: "",
    companyName: "",
  });

  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const loadProfile = async () => {
      const clientauthToken = localStorage.getItem("clientauthToken");
      const clientId = localStorage.getItem("clientId");
      if (clientauthToken && clientId) {
        const result = await fetchClientProfile(
          clientauthToken,
          parseInt(clientId, 10)
        );
        console.log(result);
        if (result.statusCode === 401) {
          if (!hasShownToast.current) {
            logoutAndHeadToClientLogin(navigate);
            hasShownToast.current = true;
          }
        } else if (result.statusCode == 200) {
          const { id } = result.client.facility;
          const facilityResult = await fetchFacilityById(clientauthToken, id);
          // console.log(facilityResult);

          if (facilityResult) {
            // console.log("Hello");
            const { name: facilityName, companyId } = facilityResult;
            const companyResult = await fetchCompanyById(
              clientauthToken,
              companyId
            );

            if (companyResult) {
              const { name: companyName } = companyResult;
              setProfile({
                name: result.client.name,
                email: result.client.email,
                facilityName,
                companyName,
                role: result.client.role,
              });
            }
          }
        }
      } else {
        logoutAndHeadToClientLogin(navigate);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logoutAndHeadToClientLogin(navigate);
  }, [navigate]);

  const handleClick = () => {
    setIsActive(true);
    navigate("/clients/training_tracks/new/participants");
    setTimeout(() => setIsActive(false), 300);
  };
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>UgoNess</h1>
        <p className={styles.subTitle}>施設管理者</p>
      </div>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div
            className={`${styles.trainingButton} ${
              isActive ? styles.active : ""
            }`}
            onClick={handleClick}
          >
            ワークアウトを始める
          </div>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <NavLink
                to="/clients/users"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <i className={`${styles.icon} material-icons`}>group</i>
                <span>利用者管理</span>
              </NavLink>
            </li>
            {profile.role === "MANAGER" && (
              <li className={styles.navItem}>
                <NavLink
                  to="/clients/trainers"
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.active}`
                      : styles.navLink
                  }
                >
                  <i className={`${styles.icon} material-icons`}>person</i>
                  <span>トレーナー管理</span>
                </NavLink>
              </li>
            )}
            <li className={styles.navItem}>
              <NavLink
                to="/clients/training_tracks"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.active}`
                    : styles.navLink
                }
              >
                <i className={`${styles.icon} material-icons`}>book</i>
                <span>レポート</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/clients/login"
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
              <div className={styles.roleContainer}>
                <p className={styles.role}>
                  {profile.role === "MANAGER" ? "施設管理者" : "トレーナー"}
                </p>
              </div>
            </div>
            <div className={styles.profileDetails}>
              <img src={FacilityIcon} alt="facility" />
              <p>{profile.facilityName}</p>
            </div>
            <div className={styles.profileDetails}>
              <img src={CompanyIcon} alt="company" />
              <p>{profile.companyName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSideBar;
