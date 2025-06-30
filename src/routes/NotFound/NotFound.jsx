import "./NotFound.css";
import img from "../../img/404-page-not-found.svg";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
  const nav = useNavigate();

  return (
    <div className="not-found">
      <img src={img} alt="" />
      <h1>Oops... Страница не найдена!</h1>
      <button onClick={() => nav("/")}>Вернуться на главную</button>
    </div>
  );
};
