import styles from "./login.client.module.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Clientlogin, LoginRequest, LoginResponse } from "./login.api";
import { LoginForm } from "../../components/LoginForm";

const ClientLogin = () => {
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
        const result: LoginResponse = await Clientlogin(credentials);

        if (result.error) {
          throw new Error(result.error);
        }
        toast.success("ログインに成功しました");
        localStorage.setItem("clientauthToken", result.authToken || "");
        localStorage.setItem("clientId", String(result.client?.id || 1));
        navigate("/clients");
      } catch (error) {
        toast.error((error as Error).message || "ログインに失敗しました");
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("clientauthToken");
    if (authToken) {
      navigate("/clients");
    }
  }, []);

  const handleBottomTextClick = () => {
    navigate("/clients/reset-password-link");
  };

  return (
    <div className={styles.container}>
      <div>
        <ToastContainer />
      </div>
      <LoginForm
        type="client"
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
        bottomText={"パスワードをお忘れですか？"}
        onBottomTextClick={handleBottomTextClick}
      />
    </div>
  );
};

export default ClientLogin;
