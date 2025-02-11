import styles from "./Button.module.scss";

export const Button = ({
  title,
  onClick,
  type = "button",
  theme = "default",
  disabled = false,
  style = {},
}: {
  title?: string;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  theme?: "default" | "red" | "blue";
  style?: React.CSSProperties;
  disabled?: boolean;
}) => {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      style={style}
      type={type}
      disabled={disabled}
      data-theme={theme}
    >
      {title}
    </button>
  );
};
