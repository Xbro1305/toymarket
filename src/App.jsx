import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./routes/home/Home";
import Footer from "./components/footer/Footer";
import SinglePage from "./routes/singlepage/SinglePage";
import NewCart from "./routes/cart/NewCart";
import { Header } from "./components/header/Header";
import Order from "./routes/orders/Order";
import OrderInfo from "./routes/orderInfo/OrderInfo";
import CategoryProducts from "./routes/categoryProducts/CategoryProducts";
import AuthTelegram from "./auth/Auth";
import { useDispatch } from "react-redux";
import { getUser } from "./api";
import { setUserInfo } from "./context/cartSlice";
import News from "./routes/categoryProducts/News";
import Search from "./routes/categoryProducts/Search";
import TypesProducts from "./routes/categoryProducts/TypesProducts";
import BySubcategories from "./routes/categoryProducts/BySubcategoriyes";
import { useLocation } from "react-router-dom";
import { NotFound } from "./routes/NotFound/NotFound";
import BrandProducts from "./routes/categoryProducts/BrandProducts";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let user = {
      id: 996493305,
      first_name: "Bahromjon",
      last_name: "Abdulhayev",
      username: "bahromjon_abdulhayev",
      photo_url:
        "https://t.me/i/userpic/320/nVfgAIJCi2wAIgtXWO_XkPV6MnhijbgkA-0x26KCbww.jpg",
      auth_date: 1746269747,
      hash: "6375b26c48865b32e33fb7345fe4dac2f66cc5ad0492a2ed06cce9cfa551b650",
    };
    localStorage.setItem("user", JSON.stringify(user));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser();
      if (userData) {
        dispatch(setUserInfo(userData));
      }
    };
    fetchData();
  }, []);

  const location = useLocation();

  const isAuthPage = location.pathname === "/auth";

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("user") && !isAuthPage) {
      window.location.href = "/auth";
    }
  }, [isAuthPage]);

  return (
    <div className="app">
      <Toaster />

      {!isAuthPage && <Header />}
      {/* <Header /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:productTypeID/:id" element={<SinglePage />} />
        <Route path="/cart" element={<NewCart />} />
        <Route path="/orders" element={<Order />} />
        <Route path="/orderInfo/:id" element={<OrderInfo />} />
        <Route path="/cat/:id" element={<CategoryProducts />} />
        <Route path="/type/:id" element={<TypesProducts />} />
        <Route path="/subcat/:id" element={<BySubcategories />} />
        <Route path="/brand/:id" element={<BrandProducts />} />

        <Route path="/search" element={<Search />} />
        <Route path="/new" element={<News />} />
        <Route path="/auth" element={<AuthTelegram />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAuthPage && <Footer />}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
