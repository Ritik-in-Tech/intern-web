import styles from "../../components/login.module.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { login, LoginRequest, LoginResponse } from "./login.api";
import { LoginForm } from "../../components/LoginForm";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (email == "" || password == "") {
      toast.error("全て必須項目です");
    } else {
      const credentials: LoginRequest = { email, password };
      try {
        const result: LoginResponse = await login(credentials);
        if (result.error) {
          throw new Error(result.error);
        }
        localStorage.setItem("authToken", result.authToken || "");
        navigate("/admin");
      } catch (error) {
        toast.error((error as Error).message || "エラーが発生しました。");
      }
    }
  };

  const handleBottomTextClick = () => {
    navigate("/admin/reset-password-link");
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      navigate("/admin");
    }
  }, []);

  return (
    <div className={styles.container}>
      <div>
        <ToastContainer />
      </div>
      <LoginForm
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
        bottomText={"パスワードをお忘れですか？"}
        onBottomTextClick={handleBottomTextClick}
        type="admin"
      />
    </div>
  );
};

export default Login;
