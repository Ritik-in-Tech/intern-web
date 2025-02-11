import { useState, useEffect } from "react";
import styles from "../../Admin/managers/managers.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchTrainers } from "./trainer.api";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/Pagination";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import { formatDateTime } from "../../utils.client";

interface Trainer {
  id: number;
  name: string;
  facility: {
    id: number;
    name: string;
  };
  createdAt: string;
}

const Trainers = () => {
  const [trainerList, setTrainerList] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const trainerPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const getTrainers = async () => {
      const authToken = localStorage.getItem("clientauthToken");
      try {
        const trainers = await fetchTrainers(authToken!);
        setTrainerList(trainers);
      } catch (error) {
        setError("トレーナーの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    getTrainers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  const filteredTrainers = trainerList.filter((trainer) =>
    trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainers.length / trainerPerPage);
  const indexOfLastTrainer = currentPage * trainerPerPage;
  const indexOfFirstTrainer = indexOfLastTrainer - trainerPerPage;
  const currentTrainer = filteredTrainers.slice(
    indexOfFirstTrainer,
    indexOfLastTrainer
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container
      title="トレーナー一覧"
      routes={["トレーナー一覧"]}
      actionButtons={
        <Button
          title="＋ 新規登録"
          onClick={() => navigate("/clients/trainers/new")}
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
            {currentTrainer.map((trainer) => (
              <tr
                key={trainer.id}
                className={styles.rowButton}
                onClick={() => navigate(`/clients/trainers/${trainer.id}`)}
              >
                <td>{trainer.name}</td>
                <td>{trainer.facility.name}</td>
                <td>{formatDateTime(trainer.createdAt)}</td>
                <td>
                  <button
                    className={styles.textButton}
                    onClick={() => navigate(`/clients/trainers/${trainer.id}`)}
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

export default Trainers;
