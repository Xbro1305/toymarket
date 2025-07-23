import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Banner from "../../components/banner/Banner";
import Catalog from "../../components/catalog/Catalog";
import formatNumber from "../../utils/numberFormat";

import "./home.css";

function Home() {
  const [totalPrice, setTotalPrice] = useState(0);
  const cart = useSelector((state) => state.cart.items);

  const getDisplayQuantity = (product) => {
    if (!product) return 0;
    return Number(product.quantity);
  };

  const getCurrentPrice = (product) => {
    const displayQuantity = getDisplayQuantity(product);

    if (
      (displayQuantity >= (+product.recomendedMinimalSize || Infinity) &&
        product.discountedPrice) ||
      product.recomendedMinimalSizeEnabled == false ||
      product.recomendedMinimalSize == 0 ||
      product.recomendedMinimalSize == 1
    ) {
      return Number(product.discountedPrice); // Chegirmali narx
    }
    return Number(product.price); // Asl narx
  };

  useEffect(() => {
    const totalPrice = cart?.reduce((acc, product) => {
      const displayQuantity = getDisplayQuantity(product);
      const currentPrice =
        product.accessabilitySettingsID == 223
          ? product.prepayAmount
          : getCurrentPrice(product);

      acc += displayQuantity * currentPrice;
      return acc;
    }, 0);
    setTotalPrice(parseInt(totalPrice));
  }, [cart]);

  return (
    <div className="home">
      <Banner />
      <Catalog />
      {totalPrice > 0 && (
        <div className="go-to-order-wrap ">
          В корзине товаров на {formatNumber(totalPrice)} ₽
        </div>
      )}
    </div>
  );
}

export default Home;
