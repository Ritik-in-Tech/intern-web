import { useState, useEffect } from "react";
import styles from "./chooseusers.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchUsers } from "../../users/api.users";
import { FaPlusCircle } from "react-icons/fa";
import { CiCircleMinus } from "react-icons/ci";
import { useNavigate, useLocation } from "react-router-dom";
import {
  calculateAge,
  formatDateOfBirth,
  formatGender,
  sortUsersByName,
} from "../../../utils.client";
import { IoIosArrowBack } from "react-icons/io";
import { MdGroups } from "react-icons/md";
import { FaRegFileVideo } from "react-icons/fa";
import { Pagination } from "../../../components/Pagination";
import { getPageNumbers } from "../../../components/Pagination/getpagenumber";
import TrainingLayout from "../trainingLayout";
import { Button } from "../../../components/Button";

interface Users {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  facilityId: number;
  medicalRecordId: string;
}

const ChooseUsers = () => {
  const [usersList, setUsersList] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const userPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUsers, setSelectedUsers] = useState<Users[]>(() => {
    return location.state?.selectedUsers || [];
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const videoIds = searchParams.get("videos") || "";
    setSelectedVideoIds(videoIds);
    const getUsers = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const users = await fetchUsers(authToken!);
        const sortedUsers = sortUsersByName(users);
        setUsersList(sortedUsers);
      } catch (error) {
        setError("ユーザーの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, [location.search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedUsers.some((selectedUser) => selectedUser.id === user.id)
  );

  const totalPages = Math.ceil(filteredUsers.length / userPerPage);

  const indexOfLastUser = currentPage * userPerPage;
  const indexOfFirstUser = indexOfLastUser - userPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleGoBack = () => {
    navigate("/clients/users");
  };

  const handleAddUser = (user: Users) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleNavigateToVideos = () => {
    const userIds = selectedUsers.map((user) => user.id).join(",");
    navigate(
      `/clients/training_tracks/new/videos?users=${userIds}&videos=${selectedVideoIds}`
    );
  };

  return (
    <TrainingLayout>
      <div className={styles.mainUserContainer}>
        <div className={styles.titleContainer}>
          <div className={styles.backButton} onClick={() => handleGoBack()}>
            <IoIosArrowBack className={styles.backIcon} />
            <p className={styles.title}>ワークアウトをやめる</p>
          </div>
        </div>
        <div className={styles.usersContainer}>
          <h2 className={styles.sectionTitle}>
            ワークアウトするユーザーを選択してください
          </h2>
          <div className={styles.tableContainer}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="お名前で検索"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>氏名</th>
                  <th>性別</th>
                  <th>年齢</th>
                  <th>カルテID</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <FaPlusCircle
                        className={styles.addIcon}
                        onClick={() => handleAddUser(user)}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{formatGender(user.gender)}</td>
                    <td>{calculateAge(user.dateOfBirth)}</td>
                    <td>{user.medicalRecordId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            paginate={paginate}
            getPageNumbers={getPageNumbers}
          />
        </div>
      </div>
      <div className={styles.selectMainContainer}>
        <div className={styles.selectContainer}>
          <div className={styles.top}>
            <MdGroups className={styles.groupIcon} />
            <div className={styles.member}>
              <p className={styles.memberTitle}>メンバー</p>
              <p className={styles.memberItems}>
                {selectedUsers.length}名選択中
              </p>
            </div>
          </div>
          <div className={styles.selectedUsersTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>氏名</th>
                  <th>年齢</th>
                </tr>
              </thead>
              <tbody>
                {selectedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <CiCircleMinus
                        className={styles.removeIcon}
                        onClick={() => handleRemoveUser(user.id)}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{calculateAge(user.dateOfBirth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Button
          title="参加する利用者を決定"
          onClick={handleNavigateToVideos}
          disabled={selectedUsers.length === 0}
        />
      </div>
    </TrainingLayout>
  );
};

export default ChooseUsers;
