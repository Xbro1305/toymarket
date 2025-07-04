import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./SinglePage.css";
import { getProductsByType } from "../../api/index";
import { FaChevronRight } from "react-icons/fa";
import { SpecRow } from "./SpecRow";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
} from "../../context/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiMinus } from "react-icons/fi";
import { IoCopyOutline, IoPaperPlaneOutline } from "react-icons/io5";

import arrowIcon from "../../img/arrow-right.svg";
import notFound from "../../img/404-page-not-found.svg";
import wildberries from "./icons/wb.png";
import avito from "./icons/avito.png";
import yandex from "./icons/ym.png";
import ozon from "./icons/ozon.png";

import formatNumber from "../../utils/numberFormat";
import { toast } from "react-hot-toast";
import ProductSlider from "./ProductSlider";
import { setSearchQuery } from "../../context/searchSlice";
import loader from "../../components/catalog/loader1.svg";

function SinglePage() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { productTypeID, id } = useParams();
  const cart = useSelector((state) => state.cart.items);
  const [products, setProducts] = useState(null);
  const [product, setProduct] = useState(null);
  const [sizes, setSizes] = useState(new Set());
  const [isSizeBtn, setIsSizeBtn] = useState(null);
  const [description, setDescription] = useState("characteristics");
  const [colors, setColors] = useState(new Set());
  const [open_marketPlaces, setOpen_marketPlaces] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModelID, setSelectedModelID] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productsData = await getProductsByType(productTypeID);

        let allProducts = productsData || [];

        const processedProducts = allProducts;
        // .filter(
        //   (product) =>
        //     product.price &&
        //     parseInt(product.price) !== 0 &&
        //     product.inStock &&
        //     parseInt(product.inStock) !== 0
        // );
        setProduct(processedProducts.find((p) => p.id === +id));
        setProducts(processedProducts);
        const modelID = processedProducts.find((p) => p.id === +id).modelID;
        // setTotalSlides(
        //   product?.otherPhotos?.length + 1 + product?.review ? 1 : 0
        // );

        setTimeout(() => {
          setColors(
            new Set(
              Object.values(
                allProducts
                  .filter((item) => item.modelID == modelID)
                  .reduce((acc, item) => {
                    if (!acc[item.color]) {
                      acc[item.color] = {
                        color: item.color,
                        img: `https://shop-api.toyseller.site/api/image/${item.id}/${item.photo}`,
                      };
                    }
                    return acc;
                  }, {})
              )
            )
          );
        }, 100);

        setIsSizeBtn(
          processedProducts
            .map((item) => item.article.slice(-2))
            .filter((item) => item !== "")[0]
        );

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, [id]);

  // console.log("product", product);

  useEffect(() => {
    setSizes(
      new Set(
        // processedProducts
        //   .map((item) => item.article.slice(-2))
        //   .filter((item) => item !== "")
        products
          ?.filter((i) => product?.textColor === i.textColor)
          .map((item) => item.article.slice(-2))
          .filter((item) => item !== "")
      )
    );
  }, [product]);

  useEffect(() => {
    const findProduct =
      product?.textColor != null
        ? products
            ?.filter((i) => i.textColor == product?.textColor)
            .find((item) => item.article.slice(-2) == isSizeBtn)
        : product;

    setProduct(findProduct || product);
  }, [isSizeBtn]);

  const sentToCart = (item) => dispatch(addToCart(item));

  const inCart = cart.find((item) => item.id === product?.id);

  const getDisplayQuantity = (inCart, product) => {
    if (!inCart || !product) return 0;

    const boxQuantity = Number(inCart.quantity) * Number(product.inBox);
    const packageSize = Number(product.inPackage);
    return packageSize && boxQuantity % packageSize !== 0
      ? Math.ceil(boxQuantity)
      : Math.floor(boxQuantity);
  };

  const handleIncrement = () => {
    if (!product) return;
    dispatch(
      incrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inStock: product.inStock,
        inTheBox: product.inTheBox,
      })
    );
  };

  const handleDecrement = (product) => {
    dispatch(
      decrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inTheBox: product.inTheBox,
      })
    );
  };

  const displayQuantity = useMemo(
    () => getDisplayQuantity(inCart, product),
    [inCart?.quantity, product?.inBox, product?.inPackage]
  );

  let some_marketPlaces =
    !product?.WBAccessible ||
    !product?.OzonAccessible ||
    !product?.AvitoAccessible ||
    !product?.YaMarketAccessible;

  let openMarketPlaces =
    (product?.WBAccessible === 0 && product?.WBURL) ||
    (product?.OzonAccessible === 0 && product?.OzonURL) ||
    (product?.AvitoAccessible === 0 && product?.AvitoURL) ||
    (product?.YaMarketAccessible === 0 && product?.YaMarketURL);

  // скидка = (1 - discountedPrice / product.price) * 100%
  let a = Number(product?.discountedPrice || 0) / Number(product?.price || 0);
  // console.log("discountedPrice", Number(product?.discountedPrice || 0));
  // console.log("price", Number(product?.price || 0));

  let b = 1 - a;
  let discount = Math.round(b * 100);
  // let discount = 100000;

  let copyFunction = () => {
    toast.success("Скопировано");
    navigator.clipboard.writeText(product?.article);
  };

  if (isLoading)
    return (
      <div className="loader">
        <img width={100} src={loader} alt="" />
      </div>
    );

  if (!product && !isLoading)
    return (
      <div className="not-found">
        <img src={notFound} alt="" />
        <p>Товар не найден</p>
        <button onClick={() => nav("/")}>Вернуться на главную</button>
      </div>
    );

  return (
    <div className="container singlepage">
      <div className="caption">
        <div className="caption-box">
          <Link to={"/category/" + product?.productTypeID}>
            <span>{product?.categoryName}</span>
          </Link>
          <FaChevronRight />
          <Link to={"/sub-category/" + product?.subCategoryID}>
            <span>{product?.subCategoryName}</span>
          </Link>
          <FaChevronRight />
          <Link to={"/type-products/" + productTypeID}>
            <span>{product?.productTypeName}</span>
          </Link>
        </div>
        <div className="caption_right">
          <span
            className="copy_article"
            onClick={() => {
              toast.success("Скопировано");
              navigator.clipboard.writeText(productTypeID + "/" + id);
            }}
          >
            <IoCopyOutline /> {productTypeID + "/" + id}
          </span>
          <span
            className="copy_article"
            onClick={() => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent("Привет, посмотри, что я нашел");
              window.open(
                `https://t.me/share/url?url=${url}&text=${text}`,
                "_blank"
              );
            }}
          >
            <IoPaperPlaneOutline /> Поделиться
          </span>
        </div>
      </div>

      <div className="product-block">
        <ProductSlider product={product} />
        <div className="single_page_right">
          <div className="product-content">
            <div className="price_and_discounts">
              <div className="p_price">
                <h3>
                  {formatNumber(
                    +product?.price <= 0
                      ? product.discountedPrice
                      : inCart
                      ? displayQuantity >= product.recomendedMinimalSize
                        ? product.discountedPrice
                        : +product?.price
                      : +product?.price
                  )}{" "}
                  ₽
                  {inCart &&
                    product?.price != "" &&
                    product?.discountedPrice != "" &&
                    displayQuantity >= product.recomendedMinimalSize && (
                      <>
                        <span className="old-price">
                          {formatNumber(
                            inCart ? +product.price : +product.discountedPrice
                          )}{" "}
                          ₽
                        </span>
                        <span className="percent">
                          {formatNumber(discount)} %
                        </span>
                      </>
                    )}
                </h3>
                <span>за 1 шт.</span>
              </div>
              {+product?.price > 0 && (
                <>
                  {!inCart && (
                    <div className="p_discount">
                      <div className="p_discount_number">
                        <span>от {product?.recomendedMinimalSize} шт.</span>
                        <h3>{formatNumber(+product?.discountedPrice)} ₽</h3>
                      </div>
                      {product?.discountedPrice && product.price ? (
                        <>
                          <div className="discount_percent">
                            <span>Скидка</span>
                            <p>{discount}%</p>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <span className="product_name">{product?.name}</span>

            {+product?.categoryID !== 3 ? (
              <></>
            ) : (
              <>
                <div className="color-box">
                  <span className="colorText">Цвет: {product?.textColor}</span>

                  <div className="colors">
                    {Array.from(colors).map((color, i) => (
                      <div
                        key={i}
                        className={`color-block ${
                          product?.color === color.color && "activeColor"
                        }`}
                        onClick={() => {
                          setIsSizeBtn(null);
                          setProduct(
                            products.find((item) => item.color === color.color)
                          );
                        }}
                      >
                        <img src={color.img} alt="" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shoesSizes">
                  <div className="shoesSizeTitle">
                    <h3 className="shoesSizeTitle_caption">Выберите размер:</h3>
                    <u>таблица размеров</u>
                  </div>

                  <div className="size_container">
                    {Array.from(sizes).map((size, i) => (
                      <div
                        key={i}
                        className={`size-block ${
                          isSizeBtn === size && "activeSize"
                        } `}
                        onClick={() => setIsSizeBtn(size)}
                      >
                        <span className="size-letter">{size}</span>
                        <div className="size-description"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <span className="remained">Осталось {product?.remained} шт. </span>

            <div className="singlepageInfoBtns">
              <button
                className={`small-white-button ${
                  description === "characteristics" ? "activePr" : ""
                }`}
                onClick={() => setDescription("characteristics")}
              >
                Характеристики
              </button>
              <button
                className={`small-white-button ${
                  description === "description" ? "activePr" : ""
                }`}
                onClick={() => setDescription("description")}
              >
                Описание
              </button>
              {/* {product?.preorder === "true" && ( */}
              <button
                className={`small-white-button ${
                  description === "order_conditions" ? "activePr" : ""
                }`}
                onClick={() => setDescription("order_conditions")}
              >
                Под заказ
              </button>
              {/* )} */}
            </div>

            <div className="description-block">
              {description === "description" && (
                // <p className="description">
                //   {product?.description ? product.description : "Описания нет"}
                // </p>
                <p
                  className="description"
                  dangerouslySetInnerHTML={{
                    __html: product?.description || "Описания нет",
                  }}
                ></p>
              )}
              {description === "characteristics" && (
                <>
                  {product?.modelName && (
                    <SpecRow label="Модель" value={product.modelName} />
                  )}
                  {product?.tradeMarkName && (
                    <SpecRow label="Бренд" value={product.tradeMarkName} />
                  )}
                  {product?.article && (
                    <SpecRow
                      label="Артикул"
                      value={product.article}
                      icon={<IoCopyOutline />}
                      func={copyFunction}
                    />
                  )}
                  {product?.producingCountry && (
                    <SpecRow
                      label="Страна-изготовитель"
                      value={product.producingCountry}
                    />
                  )}
                  {product?.material && (
                    <SpecRow label="Материал" value={product.material} />
                  )}
                  {product?.kidGender && (
                    <SpecRow label="Пол" value={product.kidGender} />
                  )}
                  {/* Bu doim chiqadi, shartli emas */}
                  <SpecRow label="Возраст" value="от 10 лет" />
                  {product?.shoeSizeLength && (
                    <SpecRow
                      label="Размер"
                      value={`${product.shoeSizeLength} мм`}
                    />
                  )}
                </>
              )}
              {description === "order_conditions" && (
                <>
                  {product?.preorderConditions && (
                    <SpecRow
                      label="Условия заказа"
                      value={product?.preorderConditions || "-"}
                    />
                  )}
                  {product?.artstoreDeliveryInDaysicle && (
                    <SpecRow
                      label="Длительность доставки"
                      value={product?.artstoreDeliveryInDaysicle || "-"}
                    />
                  )}

                  {product?.prepayPercent && (
                    <SpecRow
                      label="Предоплата"
                      value={product?.prepayPercent + "%" || "-"}
                    />
                  )}
                  {product?.prepayAmount && (
                    <SpecRow
                      label="Сумма предоплаты"
                      value={product?.prepayAmount || "-"}
                    />
                  )}

                  {product?.prepayAmount && (
                    <SpecRow
                      label="Сумма предоплаты"
                      value={product?.prepayAmount || "-"}
                    />
                  )}
                </>
              )}
            </div>

            {product?.keywords?.length > 0 && (
              <div className="product_keywords">
                <h3 className="sub-title">Ищут по запросам:</h3>
                <div className="product_keywords_items">
                  {product?.keywords?.map((el, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        nav(`/search`);
                        dispatch(setSearchQuery(el));
                      }}
                      className="request-word"
                    >
                      {el}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="product_price_box">
            <div className="price_and_discounts">
              <div className="p_price">
                <h3>
                  {formatNumber(
                    +product?.price <= 0
                      ? product.discountedPrice
                      : inCart
                      ? displayQuantity >= product.recomendedMinimalSize
                        ? product.discountedPrice
                        : +product?.price
                      : +product?.price
                  )}{" "}
                  ₽
                  {inCart &&
                    product?.price != "" &&
                    product?.discountedPrice != "" &&
                    displayQuantity >= product.recomendedMinimalSize && (
                      <>
                        <span className="old-price">
                          {formatNumber(
                            inCart ? +product.price : +product.discountedPrice
                          )}{" "}
                          ₽
                        </span>
                        <span className="percent">
                          {formatNumber(discount)} %
                        </span>
                      </>
                    )}
                </h3>
                <span>за 1 шт.</span>
              </div>
              {+product?.price > 0 && (
                <>
                  {!inCart && (
                    <div className="p_discount">
                      <div className="p_discount_number">
                        <span>от {product?.recomendedMinimalSize} шт.</span>
                        <h3>{formatNumber(+product?.discountedPrice)} ₽</h3>
                      </div>
                      {product?.discountedPrice && product.price ? (
                        <>
                          <div className="discount_percent">
                            <span>Скидка</span>
                            <p>{discount}%</p>
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {product?.packageSize != 1 && (
              <p className="min_order">
                Мин. заказ от {product?.packageSize} шт
              </p>
            )}
            <div className="product_button_block">
              {+product?.inStock > 0 ? (
                <>
                  {inCart && (
                    <div className="counter-container">
                      <button
                        className="counter-button"
                        onClick={() => handleDecrement(product)}
                      >
                        <FiMinus />
                      </button>
                      <span className="counter-value">{displayQuantity}</span>
                      <button
                        className="counter-button"
                        onClick={handleIncrement}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      inCart ? nav("/cart") : sentToCart(product)
                    }
                    className="add-button"
                  >
                    {inCart ? (
                      <>
                        В корзине <br />
                        <span className="price-span">
                          на{" "}
                          {formatNumber(
                            displayQuantity < product.recomendedMinimalSize
                              ? product?.price * displayQuantity
                              : product?.discountedPrice * displayQuantity
                          )}{" "}
                          ₽
                        </span>
                      </>
                    ) : (
                      "Добавить в корзину"
                    )}
                  </button>
                </>
              ) : (
                <button className="out-of-stock-button" disabled>
                  Нет в наличии
                </button>
              )}
            </div>

            <div className="rshz">
              РШЗ: {product?.recomendedMinimalSize} шт.
            </div>
            {!inCart ? (
              <>
                {openMarketPlaces ? (
                  <>
                    <p className="or_text">или</p>
                    <div className="other_marketplace">
                      <button
                        onClick={() =>
                          setOpen_marketPlaces((e) =>
                            some_marketPlaces ? !e : false
                          )
                        }
                      >
                        Заказать на другом маркетплейсе{" "}
                        <img
                          style={{
                            transform: open_marketPlaces
                              ? "rotate(90deg)"
                              : "rotate(0deg",
                          }}
                          src={arrowIcon}
                          alt=""
                        />
                      </button>
                      {open_marketPlaces && (
                        <div className="marketPlaces">
                          {product?.WBAccessible === 0 && product?.WBURL ? (
                            <Link to={product?.WBURL}>
                              <img src={wildberries} alt="" />
                              Купить на Wildberries
                            </Link>
                          ) : (
                            ""
                          )}
                          {product?.OzonAccessible === 0 && product?.OzonURL ? (
                            <Link to={product?.OzonURL}>
                              <img src={ozon} alt="" />
                              Купить на OZON
                            </Link>
                          ) : (
                            ""
                          )}
                          {product?.AvitoAccessible === 0 &&
                          product?.AvitoURL ? (
                            <Link to={product?.AvitoURL}>
                              <img src={avito} alt="" /> Купить на Авито
                            </Link>
                          ) : (
                            ""
                          )}
                          {product?.YaMarketAccessible === 0 &&
                          product?.YaMarketURL ? (
                            <Link to={product?.YaMarketURL}>
                              <img src={yandex} alt="" />
                              Купить на Яндекс Маркет
                            </Link>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  ""
                )}
              </>
            ) : (
              product?.recomendedMinimalSize && (
                <p className="tos">
                  Если продавец включил РШЗ = {product?.recomendedMinimalSize},
                  то количество увеличивается на размер этого шага, и
                  уменьшается на размер минимального заказа.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePage;
