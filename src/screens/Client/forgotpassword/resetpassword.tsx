import styles from "../../components/login.module.scss";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginForm } from "../../components/LoginForm";
import { resetPassword } from "../../Admin/forgotpassword/forgotpassword.api";

const ClientResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (password === "" || confirmPassword === "") {
      toast.error("全ての項目を埋めてください");
    } else if (password !== confirmPassword) {
      toast.error("パスワードと確認パスワードが一致しません");
    } else {
      try {
        console.log(id);
        const result = await resetPassword(id!, password, "client");
        console.log("Reset result:", result);
        if (result) {
          toast.success("パスワードのリセットが成功しました");
          setTimeout(() => navigate("/clients/login"), 1000);
        } else {
          toast.error(
            "トークンが見つからないか、期限切れです。新しいトークンをリクエストしてください"
          );
          navigate("/clients/reset-password-link");
        }
      } catch (error) {
        toast.error((error as Error).message || "エラーが発生しました。");
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/clients");
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
        type="client"
      />
    </div>
  );
};

export default ClientResetPassword;
