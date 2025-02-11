import styles from "../../components/login.module.scss";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoginForm } from "../../components/LoginForm";
import { getResetPasswordUrl } from "../../Admin/forgotpassword/forgotpassword.api";
import Loader from "../../components/Loader";
const ClientPasswordResetLink = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (email == "") {
      toast.error("メールアドレスが必要です。");
    } else {
      setLoading(true);
      try {
        const resetUrl = await getResetPasswordUrl("clients", email);
        if (resetUrl) {
          console.log(resetUrl);
          toast.success("パスワード再設定用のメールを送信しました。");
          setEmail("");
        } else {
          toast.error("このメールアドレスは登録されていません");
        }
      } catch (error) {
        toast.error((error as Error).message || "エラーが発生しました。");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("clientauthToken");
    if (authToken) {
      navigate("/clients");
    }
  }, []);

  return (
    <div className={styles.container}>
      <div>
        <ToastContainer />
      </div>
      <LoginForm
        topText={"パスワード再設定用のメールを送信します"}
        email={email}
        setEmail={setEmail}
        handleSubmit={handleSubmit}
        type="client"
      />
      {loading && (
        <div className={styles.loaderOverlay}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default ClientPasswordResetLink;
