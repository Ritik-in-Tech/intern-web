import { useState, useEffect } from "react";
import styles from "./managers.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchManagers } from "./api.manager";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/Pagination";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import { formatDateTime } from "../../utils.client";

interface Manager {
  id: number;
  name: string;
  facility: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const Managers = () => {
  const [managerList, setManagerList] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const managerPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const getManagers = async () => {
      const authToken = localStorage.getItem("authToken");
      try {
        const managers = await fetchManagers(authToken!);
        console.log(managers);
        setManagerList(managers);
      } catch (error) {
        setError("施設管理者の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    getManagers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredManagers = managerList.filter((manager) =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredManagers.length / managerPerPage);

  const indexOfLastManager = currentPage * managerPerPage;
  const indexOfFirstManager = indexOfLastManager - managerPerPage;
  const currentManager = filteredManagers.slice(
    indexOfFirstManager,
    indexOfLastManager
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container
      title="施設管理者編集"
      routes={["施設管理者一覧"]}
      actionButtons={
        <Button
          title="＋ 新規登録"
          onClick={() => navigate("/admin/managers/new")}
        />
      }
    >
      <div className={styles.tableContainer}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="お名前で検索..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>氏名</th>
              <th>所属</th>
              <th>作成日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentManager.map((manager) => (
              <tr key={manager.id}>
                <td>{manager.name}</td>
                <td>{manager.facility.name}</td>
                <td>{formatDateTime(manager.createdAt)}</td>
                <td>
                  <button
                    className={styles.textButton}
                    onClick={() => navigate(`/admin/managers/${manager.id}`)}
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

export default Managers;
