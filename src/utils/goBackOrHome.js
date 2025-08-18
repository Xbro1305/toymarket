// useGoBackOrHome.ts
import { useNavigate } from "react-router-dom";

export const useGoBackOrHome = () => {
  const navigate = useNavigate();

  const goBackOrHome = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return goBackOrHome;
};
