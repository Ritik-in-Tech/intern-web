import React from "react";
import styles from "./Container.module.scss";

interface Route {
  text: string;
  onClick: () => void;
}

interface ContainerProps {
  title?: string;
  subtitle?: string;
  routes?: (string | Route | null | undefined)[];
  actionButtons?: React.ReactNode;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  title,
  subtitle,
  routes,
  actionButtons,
}) => {
  return (
    <div className={styles.container}>
      {title ? (
        <div>
          {routes ? (
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumb__item}>ホーム</span>
              {routes.map((route, index) => (
                <React.Fragment key={index}>
                  <span className={styles.breadcrumb__arrow}>{">"}</span>
                  {route ? (
                    typeof route === "string" ? (
                      <span className={styles.breadcrumb__item}>{route}</span>
                    ) : (
                      <span
                        className={`${styles.breadcrumb__item} ${styles.breadcrumb_clickable}`}
                        onClick={route.onClick}
                      >
                        {route.text}
                      </span>
                    )
                  ) : (
                    <span className={styles.breadcrumb__item}>
                      Invalid route
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : null}
          <div className={styles.container__header}>
            <div>
              <h1 className={styles.container__title}>{title}</h1>
              {subtitle && (
                <p className={styles.container__subtitle}>{subtitle}</p>
              )}
            </div>
            <div>{actionButtons}</div>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
};
