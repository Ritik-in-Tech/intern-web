// src/components/Layout.js
import React, { ReactNode } from "react";
import Sidebar from "./sidebar";
import styles from "../layout.module.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LayoutProps = {
  children: ReactNode;
};
const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div>
        <ToastContainer />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default AdminLayout;
