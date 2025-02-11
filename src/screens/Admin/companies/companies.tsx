import { useState, useEffect } from "react";
import styles from "../facilities/facilities.module.scss";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../utils.client";
import { Pagination } from "../../components/Pagination";
import { getPageNumbers } from "../../components/Pagination/getpagenumber";
import { Container } from "../../components/Container";
import { Button } from "../../components/Button";
import { fetchCompanies } from "./api.companies";

interface Company {
  id: number;
  name: string;
  location: string;
  numberOfFacilities: number;
  numberOfClients: number;
  numberOfUsers: number;
  numberOfTrainingHistories: number;
}

const Companies = () => {
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const companyPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const getCompanies = async () => {
      const authToken = localStorage.getItem("authToken");
      try {
        const companies = await fetchCompanies(authToken!);
        setCompanyList(companies);
      } catch (error) {
        setError("Failed to fetch companies");
      } finally {
        setLoading(false);
      }
    };

    getCompanies();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredCompany = companyList.filter((facility) =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompany.length / companyPerPage);
  const indexOfLastCompany = currentPage * companyPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companyPerPage;
  const currentCompany = filteredCompany.slice(
    indexOfFirstCompany,
    indexOfLastCompany
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Container
      title="企業一覧"
      routes={["企業一覧"]}
      actionButtons={
        <Button
          title="＋ 新規登録"
          onClick={() => navigate("/admin/companies/new")}
        />
      }
    >
      <div className={styles.tableContainer}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="企業名で検索"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>企業名</th>
              <th>所在地</th>
              <th>施設数</th>
              <th>管理者数</th>
              <th>利用者数</th>
              <th>ワークアウト</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentCompany.map((company) => (
              <tr
                key={company.id}
                onClick={() => navigate(`/admin/companies/${company.id}`)}
                className={styles.rowButon}
              >
                <td>{company.name}</td>
                <td>{company.location}</td>
                <td>{company.numberOfFacilities}</td>
                <td>{company.numberOfClients}</td>
                <td>{company.numberOfUsers}</td>
                <td>{company.numberOfTrainingHistories}</td>
                <td>
                  <button
                    className={styles.textButton}
                    onClick={() => navigate(`/admin/companies/${company.id}`)}
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

export default Companies;
