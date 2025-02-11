// src/components/Layout.js
import React, { ReactNode } from "react";
import styles from "../layout.module.scss";
import ClientSideBar from "./sidebar.client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type LayoutProps = {
  children: ReactNode;
};

const ClientLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <ClientSideBar />
      <div>
        <ToastContainer />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default ClientLayout;
