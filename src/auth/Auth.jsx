import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../img/logo.png";
import { LoginButton } from "@telegram-auth/react";
import "./auth.css";
import { BiLogoTelegram } from "react-icons/bi";

const AuthTelegram = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      navigate("/");
    }
  }, [navigate]);
  const tg = window.Telegram.WebApp;

  console.log(tg.initDataUnsafe, tg.user);

  return (
    <div className="container-order-data">
      <div className="order-form order-form-auth">
        <div className="logo-container">
          <img src={logo} className="logoIcon" alt="Logo" />
        </div>

        <main className="telegram-wrapper">
          <button
            onClick={() => {
              const user = {
                hash: tg.initDataUnsafe.hash,
                auth_date: tg.initDataUnsafe.auth_date,
                ...tg.initDataUnsafe.user,
              };

              localStorage.setItem("user", JSON.stringify(user));
              navigate("/");
            }}
            style={{
              background: "#54a9eb",
              borderRadius: "5px",
              padding: "9px 21px",
              display: "flex",
              alignItems: "center",
              gap: "13px",
              border: "none",
              fontSize: "16px",
              color: "white",
            }}
          >
            <BiLogoTelegram />
            Войти как {window?.Telegram?.initDataUnsafe?.user?.first_name}
          </button>
          <p className="politic">
            Авторизовываясь на маркетплейсе Тоймаркет через сервис Telegram, Вы
            соглашаетесь с
            <a
              href="https://spruton.ru/legal/privacy/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Политикой конфиденциальности{" "}
            </a>
            и
            <a
              href="https://spruton.ru/legal/rules/"
              target="_blank"
              rel="noreferrer"
            >
              {" "}
              Пользовательским соглашением{" "}
            </a>
            платформы СПРУТОН
          </p>
        </main>

        <footer className="footer-auth">
          <p>
            Работает на платформе
            <a href="https://spruton.ru/" target="_blank" rel="noreferrer">
              {" "}
              СПРУТОН{" "}
            </a>
            Интегратор
            <a href="https://octobyte.ru/" target="_blank" rel="noreferrer">
              {" "}
              Октобайт{" "}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthTelegram;
