import styles from "./LoginForm.module.scss";

export const LoginForm = ({
  email,
  password,
  setEmail,
  setPassword,
  handleSubmit,
  confirmPassword,
  setConfirmPassword,
  type,
  topText,
  bottomText,
  onBottomTextClick,
}: {
  email?: string;
  password?: string;
  confirmPassword?: string;
  setEmail?: (email: string) => void;
  setPassword?: (password: string) => void;
  setConfirmPassword?: (confirmPassword: string) => void;
  handleSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type: "client" | "admin";
  topText?: string;
  bottomText?: string;
  onBottomTextClick?: () => void;
}) => {
  return (
    <div className={styles.loginBox} data-type={type}>
      <h1 className={styles.title}>
        <span className={styles.title__logo}>UgoNess</span>
        <span className={styles.title__role}>
          {type === "client" ? "施設管理者" : "運営管理者"}
        </span>
      </h1>
      <div className={styles.inputContainer}>
        {topText && <p className={styles.topText}>{topText}</p>}
        {email !== undefined && (
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              placeholder="ugoness@example.com"
              value={email}
              onChange={(e) => setEmail && setEmail(e.target.value)}
            />
          </div>
        )}
        {password !== undefined && (
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              placeholder="xxxxxxxx"
              value={password}
              onChange={(e) => setPassword && setPassword(e.target.value)}
            />
          </div>
        )}
        {confirmPassword !== undefined && (
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              パスワード（確認）
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="xxxxxxxx"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword && setConfirmPassword(e.target.value)
              }
            />
          </div>
        )}
        <button onClick={handleSubmit} className={styles.loginButton}>
          {email !== undefined && password === undefined
            ? "メールを送信する"
            : "ログイン"}
        </button>
        {bottomText && (
          <p
            className={styles.optionalText}
            onClick={onBottomTextClick}
            style={{ cursor: onBottomTextClick ? "pointer" : "default" }}
          >
            {bottomText}
          </p>
        )}
      </div>
    </div>
  );
};
