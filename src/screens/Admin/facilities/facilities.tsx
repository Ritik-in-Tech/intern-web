import { useState, useEffect } from "react";
import styles from "./facilities.module.scss";
import { FaSearch } from "react-icons/fa";
import { fetchFacilities } from "./api.facilities";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../utils.client";
import { Pagination } from "../../components/Pagination";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";

interface Facility {
  id: number;
  name: string;
  location: string;
  createdAt: string;
}

const Facilities = () => {
  const [facilityList, setFacilityList] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const facilityPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const getFacilities = async () => {
      const authToken = localStorage.getItem("authToken");
      try {
        const facilities = await fetchFacilities(authToken!);
        setFacilityList(facilities);
      } catch (error) {
        setError("Failed to fetch facilities");
      } finally {
        setLoading(false);
      }
    };

    getFacilities();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredFacility = facilityList.filter((facility) =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFacility.length / facilityPerPage);

  const indexOfLastFacility = currentPage * facilityPerPage;
  const indexOfFirstFacility = indexOfLastFacility - facilityPerPage;
  const currentFacility = filteredFacility.slice(
    indexOfFirstFacility,
    indexOfLastFacility
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container
      title="施設一覧"
      routes={["施設一覧"]}
      actionButtons={
        <Button
          title="＋ 新規登録"
          onClick={() => navigate("/admin/facilities/new")}
        />
      }
    >
      <div className={styles.tableContainer}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="検索..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>施設名</th>
              <th>所在地</th>
              <th>作成日時</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentFacility.map((facility) => (
              <tr key={facility.id}>
                <td>{facility.name}</td>
                <td>{facility.location}</td>
                <td>{formatDateTime(facility.createdAt)}</td>
                <td>
                  <button
                    className={styles.textButton}
                    onClick={() => navigate(`/admin/facilities/${facility.id}`)}
                  >
                    編集
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

export default Facilities;
