import React from "react";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  getPageNumbers: (current: number, total: number) => (number | string)[];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  paginate,
  getPageNumbers,
}) => {
  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationButton}
        onClick={() => paginate(currentPage > 2 ? currentPage - 1 : 1)}
        disabled={currentPage === 1}
      >
        &#171; 前へ
      </button>
      {getPageNumbers(currentPage, totalPages).map((number, index) =>
        number === currentPage ? (
          <button
            key={index}
            className={`${styles.paginationText} ${styles.activePage}`}
            onClick={() => paginate(number as number)}
          >
            {number}
          </button>
        ) : (
          <span
            key={index}
            className={styles.paginationText}
            onClick={() =>
              typeof number === "number" ? paginate(number) : null
            }
          >
            {number}
          </span>
        )
      )}
      <button
        className={styles.paginationButton}
        onClick={() =>
          paginate(currentPage < totalPages - 1 ? currentPage + 1 : totalPages)
        }
        disabled={currentPage === totalPages}
      >
        後へ &#187;
      </button>
    </div>
  );
};
