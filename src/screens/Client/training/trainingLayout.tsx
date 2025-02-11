// src/components/Layout.js
import React, { ReactNode } from "react";
import styles from "./trainingLayout.module.scss";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

type LayoutProps = {
  children: ReactNode;
};

const TrainingLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.maincontainer}>
      <ToastContainer />
      {children}
    </div>
  );
};

export default TrainingLayout;
