import React from "react";
import styles from "./stats.module.scss";

interface StatItem {
  label: string;
  value: string;
}

interface StatisticsBarProps {
  stats: StatItem[];
}

const StatisticsBar: React.FC<StatisticsBarProps> = ({ stats }) => {
  return (
    <div className={styles.container}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.items}>
          <div className={styles.label}>{stat.label}</div>
          <div className={styles.value}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsBar;
