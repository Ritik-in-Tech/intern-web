import styles from "../../components/login.module.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginForm } from "../../components/LoginForm";
import { resetPassword } from "./forgotpassword.api";
const ResetPassword = () => {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (password == "" || confirmPassword == "") {
      toast.error("全ての項目を埋めてください");
    } else if (password !== confirmPassword) {
      toast.error("パスワードと確認パスワードが一致しません");
    } else {
      try {
        console.log(id);
        const result = await resetPassword(id!, password, "admin");
        console.log("Reset result:", result);
        if (result) {
          toast.success("パスワードのリセットが成功しました");
          setTimeout(() => navigate("/admin/login"), 1000);
        } else {
          toast.error(
            "トークンが見つからないか、期限切れです。新しいトークンをリクエストしてください"
          );
          navigate("/admin/reset-password-link");
        }
      } catch (error) {
        toast.error((error as Error).message || "エラーが発生しました。");
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/admin");
    }
  }, []);

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={5000} />
      <LoginForm
        topText={"新しいパスワードを設定します"}
        password={password}
        confirmPassword={confirmPassword}
        setPassword={setPassword}
        setConfirmPassword={setConfirmPassword}
        handleSubmit={handleSubmit}
        type="admin"
      />
    </div>
  );
};

export default ResetPassword;
