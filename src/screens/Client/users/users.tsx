import { useState, useEffect } from "react";
import styles from "./users.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchUsers } from "./api.users";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/Pagination";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import {
  formatGender,
  formatDateTime,
  calculateAge,
  sortUsersByName,
} from "../../utils.client";

interface Users {
  id: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  facilityId: number;
  medicalRecordId: string;
}

const Users = () => {
  const [usersList, setUsersList] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const userPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredUsers = usersList.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / userPerPage);

  const indexOfLastUser = currentPage * userPerPage;
  const indexOfFirstUser = indexOfLastUser - userPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container
      title="利用者一覧"
      routes={["利用者一覧"]}
      actionButtons={
        <>
          <Button
            title="+ CSVで一括登録"
            style={{ marginRight: "8px" }}
            onClick={() => navigate("/clients/users/new-csv")}
          />
          <Button
            title="＋ 新規登録"
            onClick={() => navigate("/clients/users/new")}
          />
        </>
      }
    >
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
              <th>氏名</th>
              <th>性別</th>
              <th>年齢</th>
              <th>カルテID</th>
              <th>作成日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr
                key={user.id}
                className={styles.rowButton}
                onClick={() => navigate(`/clients/users/${user.id}`)}
              >
                <td>{user.name}</td>
                <td>{formatGender(user.gender)}</td>
                <td>{calculateAge(user.dateOfBirth)}</td>
                <td>{user.medicalRecordId}</td>
                <td>{formatDateTime(user.createdAt)}</td>
                <td>
                  <button
                    className={styles.textButton}
                    onClick={() => navigate(`/clients/users/${user.id}`)}
                  >
                    詳細
                  </button>
                </td>
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
    </Container>
  );
};

export default Users;
