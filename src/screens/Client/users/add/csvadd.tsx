import { useCallback, useRef, useState } from "react";
import styles from "./useradd.module.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Container } from "../../../components/Container";
import { handleUserListPage } from "../../../utils.client";
import { uploadUsers } from "../api.users";
import { AWS_S3_BUCKET_NAME } from "../../../constant";

const CSVAddUser = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type === "text/csv") {
        setSelectedFile(file);
      } else {
        toast.error("CSVファイルのみ許可されています。");
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const navigateToLogin = useCallback(
    () => navigate("/clients/login"),
    [navigate]
  );

  const handleTemplateDownload = () => {
    const link = document.createElement("a");
    link.href = "/template_user.csv";
    link.download = "template_user.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("ファイルを選択してください");
      return;
    }
    try {
      const clientauthToken = localStorage.getItem("clientauthToken");
      if (!clientauthToken) {
        toast.error("再度ログインしてください。", {
          onClose: navigateToLogin,
        });
        return;
      }

      const response = await uploadUsers(selectedFile, clientauthToken);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }

      toast.success("ユーザーは正常にアップロードされました。");
      setTimeout(() => {
        handleUserListPage(navigate);
      }, 1000);
    } catch (error: any) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }

      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("ユーザーのアップロード中にエラーが発生しました。");
      }
    }
  };

  return (
    <Container
      title="利用者CSV一括登録"
      routes={[
        {
          text: "利用者一覧",
          onClick: () => handleUserListPage(navigate),
        },
        "利用者CSV一括登録",
      ]}
    >
      <div>
        <div className={styles.guidlines}>
          <p className={styles.text}>
            (1) テンプレートのcsvファイルをダウンロードしてください。
          </p>
          <div className={styles.text}>
            (2) Excelの2行目から利用者情報を登録してください。
            <ul className={styles.alert}>
              <li>※ お名前、性別、生年月日の入力は必須です。</li>
              <li>
                ※ 性別は「男性」「女性」「その他」のいずれかで入力してください。
              </li>
              <li>
                ※ 生年月日は半角数字と半角記号で1950-01-30 (yyy-mm-dd or
                yyyy/mm/dd) のように入力してください。
              </li>
              <li>
                ※
                機能レベルは「自立」、「要支援１」、「要支援２」、「要介護１」、「要介護２」、「要介護３」、「要介護４」、「要介護５」のいずれかを入力してください。
              </li>
            </ul>
          </div>
          <p className={styles.text}>
            (3) Excelをcsvファイル(utf-8)で保存し、アップロードしてください
          </p>
        </div>
        <p className={styles.buttonTitle}>利用者情報をアップロードする</p>
        <div className={styles.buttonOptions}>
          <div className={styles.file}>
            <input
              type="file"
              id="file-upload"
              accept=".csv"
              onChange={handleFileChange}
              className={styles.fileInput}
              ref={fileInputRef}
            />
            <label htmlFor="file-upload" className={styles.fileLabel}>
              {selectedFile ? selectedFile.name : "ファイルを選択"}
            </label>
          </div>
          <button
            className={styles.templateButton}
            onClick={handleTemplateDownload}
          >
            テンプレートをダウンロード
          </button>
        </div>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
        >
          作成する
        </button>
      </div>
    </Container>
  );
};

export default CSVAddUser;
