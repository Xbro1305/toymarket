import React, { useState, useEffect } from "react";
import { useLazyGetNewProductsLazyQuery } from "../../context/service/productsApi";
import filterIcon from "../../img/filter.svg";
import sortIcon from "../../img/sort.svg";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity } from "../../context/cartSlice";
import { FiPlus, FiMinus } from "react-icons/fi";
import formatNumber from "../../utils/numberFormat";
import { useNavigate, Link, useParams } from "react-router-dom";
import FilterModal from "./FilterModal";
import { BsChevronLeft } from "react-icons/bs";
import SortModal from "./SortModal";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_LIMIT = 20;

const MAX_PRODUCTS = 200;

function CategoryProducts() {
  // const { categoryID } = useParams(); // оставил, если в будущем понадобится
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchQuery = useSelector((state) => state.search.searchQuery);
  const cartData = useSelector((state) => state.cart.items);

  const [offset, setOffset] = useState(0);
  const [newProducts, setNewProducts] = useState([]); // полный список, полученный с бэка
  const [processedProducts, setProcessedProducts] = useState([]); // нормализованный список
  const [filteredProducts, setFilteredProducts] = useState([]); // после фильтров/поиска

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [statusAccordionOpen, setStatusAccordionOpen] = useState(false);
  const [statusPriceOpen, setStatusPriceOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    status: "all",
    priceFrom: "",
    priceTo: "",
    article: "",
  });
  const [sortOrder, setSortOrder] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({}); // { [productId]: true }

  /* =========================== Запрос данных =========================== */
  const [fetchNewProducts] = useLazyGetNewProductsLazyQuery();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchNewProducts({
          limit: PAGE_LIMIT,
          offset,
          inStock: 1,
        }).unwrap();
        const data = res?.data ?? [];

        // Добавляем новые товары, избегая перезаписи прошлого состояния
        setNewProducts((prev) => [...prev, ...data]);

        // Добавляем условие остановки подгрузки
        if (
          data.length < PAGE_LIMIT ||
          newProducts.length + data.length >= MAX_PRODUCTS
        ) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Ошибка загрузки новинок:", e);
        setHasMore(false);
      }
    };

    load();
  }, [offset, fetchNewProducts]);

  const fetchMoreData = () => {
    if (hasMore) setOffset((prev) => prev + PAGE_LIMIT);
  };

  /* ===================== Нормализация и устранение дубликатов ===================== */
  useEffect(() => {
    const unique = [];

    // newProducts.reduce((_, product) => {
    //   if (+product.categoryID === 3) {
    //     if (
    //       !unique.some(
    //         (u) => u.modelID == product.modelID && u.color == product.color
    //       )
    //     ) {
    //       unique.push(product);
    //     }
    //   } else {
    //     unique.push(product);
    //   }
    // }, []);
    const temp = [];

    newProducts
      .filter((p) => +p.inStock > 0)
      .forEach((i) => {
        const uniqueById = temp.find((p) => p.id == i.id);
        temp.push(i);
        if (!uniqueById) return i;
      });

    temp.forEach((product) => {
      if (
        !unique.some(
          (u) => u.modelID == product.modelID && u.color == product.color
        )
      ) {
        unique.push(product);
      }
    });

    console.log(unique);
    setProcessedProducts(unique);
  }, [newProducts]);

  /* ============================ Поиск и фильтры ============================ */
  useEffect(() => {
    let result = [...processedProducts];

    // Статус (наличие)
    if (pendingFilters.status === "inStock")
      result = result.filter((p) => +p.inStock > 0);
    if (pendingFilters.status === "outOfStock")
      result = result.filter((p) => +p.inStock === 0);

    // Диапазон цен
    if (pendingFilters.priceFrom)
      result = result.filter((p) => +p.price >= +pendingFilters.priceFrom);
    if (pendingFilters.priceTo)
      result = result.filter((p) => +p.price <= +pendingFilters.priceTo);

    // По артикулу
    if (pendingFilters.article) {
      const val = pendingFilters.article.toLowerCase();
      result = result.filter((p) => p.article.toLowerCase().includes(val));
    }

    // Глобальный поиск
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.article.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(result);
  }, [processedProducts, pendingFilters, searchQuery]);

  /* ============================ Хэндлеры ============================ */
  const handleIncrement = (product) => {
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
    console.log("Decrementing product:", product);
    dispatch(
      decrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inTheBox: product.inTheBox,
      })
    );
  };

  const getDisplayQuantity = (inCart, product) => {
    if (!inCart || !product) return 0;

    // const boxQuantity = Number(inCart.quantity) * Number(product.inBox);
    // const packageSize = Number(product.inPackage);
    // return packageSize && boxQuantity % packageSize !== 0
    //   ? Math.ceil(boxQuantity)
    //   : Math.floor(boxQuantity);

    return inCart.quantity;
  };
  const handleLocalSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilteredProducts(
      processedProducts.filter((p) => p.name.toLowerCase().includes(value))
    );
  };

  const onImageLoad = (id) =>
    setImageLoaded((state) => ({
      ...state,
      [id]: true,
    }));

  /* ============================ Разметка ============================ */
  return (
    <div className="container categoryProducts">
      <div className="categoryProducts_title">
        <div onClick={() => navigate(-1)} className="left">
          <BsChevronLeft />
          <span>Новинки</span>
        </div>

        <input
          onChange={handleLocalSearch}
          className="search_input"
          type="text"
          placeholder="Поиск...."
        />

        <div className="right">
          <button className="form-filter" onClick={() => setIsFilterOpen(true)}>
            <img src={filterIcon} alt="filter" />
            <span>Фильтры</span>
          </button>
          <button className="form-sort" onClick={() => setIsSortOpen(true)}>
            <img src={sortIcon} alt="sort" />
            <span>Сортировка</span>
          </button>
        </div>
      </div>

      <InfiniteScroll
        dataLength={filteredProducts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<p className="noMore">Загрузка...</p>}
        endMessage={<p className="noMore">Других товаров нет!</p>}
      >
        <div className="catalogItem_cards">
          {filteredProducts.map((product) => {
            const inCart = cartData.find((item) => item.id === product.id);
            const displayQuantity = getDisplayQuantity(inCart, product);
            const imgLoaded = imageLoaded[product.id];

            return (product?.price != 0 || product?.discountedPrice != 0) &&
              [222, 223, 224].includes(product.accessabilitySettingsID) ? (
              <div key={product.id} className="catalogItem_card">
                <Link
                  className="product-img-link"
                  to={`/item/${product.productTypeID}/${product.id}`}
                >
                  {+product?.discountedPrice !== +product?.price &&
                  +product?.price &&
                  +product?.discountedPrice ? (
                    <div className="mark_discount">%</div>
                  ) : null}
                  <img
                    src={`https://shop-api.toyseller.site/api/image/${product.id}/${product.image}`}
                    alt={product.article}
                    className={`product-image ${
                      imgLoaded ? "loaded" : "loading"
                    }`}
                    onLoad={() => onImageLoad(product.id)}
                  />

                  <div className="mark_new_product">
                    <span>Новинка</span>
                  </div>
                </Link>
                <p className="name">{product.name}</p>
                {product?.accessabilitySettingsID == 222 ? (
                  product?.inStock > 0 ? (
                    <p className="weight">Осталось: {product.inStock} шт</p>
                  ) : (
                    ""
                  )
                ) : product?.accessabilitySettingsID == 223 ? (
                  product?.storeDeliveryInDays != "" &&
                  product?.prepayPercent != "" ? (
                    <>
                      <p className="weight">
                        Под заказ: {product?.storeDeliveryInDays} дн.
                      </p>

                      <p className="weight">
                        Предоплата: {product?.prepayPercent} %
                      </p>
                    </>
                  ) : (
                    <p className="weight">Осталось: {product.inStock} шт</p>
                  )
                ) : product?.accessabilitySettingsID == 224 ? (
                  <p className="weight">Всегда в наличии</p>
                ) : (
                  ""
                )}

                {product?.discountedPrice != 0 &&
                  product?.price != 0 &&
                  product?.recomendedMinimalSizeEnabled === 1 &&
                  product?.recomendedMinimalSize > 1 && (
                    <p className="weight">
                      от {product?.recomendedMinimalSize} шт по{" "}
                      {product?.discountedPrice} ₽{" "}
                    </p>
                  )}
                {product?.inStock > 0 ? (
                  inCart ? (
                    <div className="add catalog_counter">
                      <FiMinus onClick={() => handleDecrement(product)} />
                      <p className="amount">{displayQuantity}</p>
                      <FiPlus onClick={() => handleIncrement(product)} />
                    </div>
                  ) : (
                    <div
                      className="price"
                      onClick={() =>
                        navigate(`/item/${product.productTypeID}/${product.id}`)
                      }
                    >
                      {formatNumber(+product.price || +product.discountedPrice)}{" "}
                      ₽
                    </div>
                  )
                ) : (
                  <div className="price">Нет в наличии</div>
                )}
              </div>
            ) : (
              ""
            );
          })}
        </div>
      </InfiniteScroll>

      {/* ------------------------------ Модальные ------------------------------ */}
      <FilterModal
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        pendingFilters={pendingFilters}
        setPendingFilters={setPendingFilters}
        statusAccordionOpen={statusAccordionOpen}
        setStatusAccordionOpen={setStatusAccordionOpen}
        statusPriceOpen={statusPriceOpen}
        setStatusPriceOpen={setStatusPriceOpen}
      />

      <SortModal
        isSortOpen={isSortOpen}
        setIsSortOpen={setIsSortOpen}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        filteredProducts={filteredProducts}
        setFilteredProducts={setFilteredProducts}
      />
    </div>
  );
}
export default CategoryProducts;

// import React, { useState, useEffect } from "react";
// import { useGetNewProductsQuery } from "../../context/service/itemsApi";
// import { useDispatch, useSelector } from "react-redux";
// import { decrementQuantity, incrementQuantity } from "../../context/cartSlice";
// import { FiPlus, FiMinus } from "react-icons/fi";
// import formatNumber from "../../utils/numberFormat";
// import { useNavigate, Link, useParams } from "react-router-dom";
// import FilterModal from "./FilterModal";
// import SortModal from "./SortModal";
// import InfiniteScroll from "react-infinite-scroll-component";
// import filterIcon from "../../img/filter.svg";
// import sortIcon from "../../img/sort.svg";
// import { BsChevronLeft } from "react-icons/bs";

// function CategoryProducts() {
//   const dispatch = useDispatch();
//   const { categoryID } = useParams();

//   const { data: newProductsData } = useGetNewProductsQuery(0);
//   const newProducts = newProductsData?.data || [];
//   const searchQuery = useSelector((state) => state.search.searchQuery);
//   const cartData = useSelector((state) => state.cart.items);
//   const navigate = useNavigate();

//   const [products, setProducts] = useState([]);
//   const [categoryName, setCategoryName] = useState("");
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [visibleProducts, setVisibleProducts] = useState([]);
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [statusAccordionOpen, setStatusAccordionOpen] = useState(false);
//   const [statusPriceOpen, setStatusPriceOpen] = useState(false);
//   const [pendingFilters, setPendingFilters] = useState({
//     status: "all",
//     priceFrom: "",
//     priceTo: "",
//     article: "",
//   });
//   const [isSortOpen, setIsSortOpen] = useState(false);
//   const [sortOrder, setSortOrder] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasMore, setHasMore] = useState(true);
//   const [itemsPerPage] = useState(20);
//   const [page, setPage] = useState(1);

//   // Fetch and process products
//   useEffect(() => {
//     let categoryNameTemp = "Новинки";

//     const processedProducts = newProducts
//       .filter(
//         (product) =>
//           product.price &&
//           parseInt(product.price) !== 0 &&
//           product.inStock &&
//           parseInt(product.inStock) !== 0
//       )
//       .reduce((unique, product) => {
//         if (product.categoryID === 3) {
//           const key = `${product.color}-${product.size}`;
//           const exists = unique.some((p) => `${p.color}-${p.size}` === key);
//           if (!exists) {
//             unique.push(product);
//           }
//         } else {
//           unique.push(product);
//         }
//         return unique;
//       }, []);

//     setProducts(processedProducts);
//     setCategoryName(categoryNameTemp);
//     setFilteredProducts(processedProducts);
//   }, [categoryID, newProducts]);

//   // Apply additional filters and search
//   useEffect(() => {
//     let result = [...products];

//     if (pendingFilters.status === "inStock") {
//       result = result.filter((product) => product.inStock > 0);
//     } else if (pendingFilters.status === "outOfStock") {
//       result = result.filter((product) => product.inStock === 0);
//     }

//     if (pendingFilters.priceFrom) {
//       result = result.filter(
//         (product) => +product.price >= +pendingFilters.priceFrom
//       );
//     }
//     if (pendingFilters.priceTo) {
//       result = result.filter(
//         (product) => +product.price <= +pendingFilters.priceTo
//       );
//     }

//     if (pendingFilters.article) {
//       result = result.filter((product) =>
//         product.article
//           .toLowerCase()
//           .includes(pendingFilters.article.toLowerCase())
//       );
//     }

//     if (searchQuery) {
//       result = result.filter((product) =>
//         product.article.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredProducts(result);
//     setPage(1);
//     const initialItems = result.slice(0, itemsPerPage);
//     setVisibleProducts(initialItems);
//     setHasMore(result.length > itemsPerPage);
//   }, [products, pendingFilters, searchQuery]);

//   const fetchMoreData = () => {
//     console.log("ok");

//     const nextPage = page + 1;
//     const newItems = filteredProducts.slice(0, nextPage * itemsPerPage);
//     setVisibleProducts(newItems);
//     setPage(nextPage);
//     setHasMore(newItems.length < filteredProducts.length);
//   };

//   const getDisplayQuantity = (inCart, product) => {
//     if (!inCart || !product) return 0;
//     const boxQuantity = Number(inCart.quantity) * Number(product.inBox);
//     const packageSize = Number(product.inPackage);
//     return packageSize && boxQuantity % packageSize !== 0
//       ? Math.ceil(boxQuantity)
//       : Math.floor(boxQuantity);
//   };

//   const handleIncrement = (product) => {
//     dispatch(
//       incrementQuantity({
//         productId: product.id,
//         inBox: product.inBox,
//         inPackage: product.inPackage,
//         inStock: product.inStock,
//         inTheBox: product.inTheBox,
//       })
//     );
//   };

//   const handleDecrement = (product) => {
//     dispatch(
//       decrementQuantity({
//         productId: product.id,
//         inBox: product.inBox,
//         inPackage: product.inPackage,
//         inTheBox: product.inTheBox,
//       })
//     );
//   };

//   return (
//     <div className="container categoryProducts">
//       <div className="categoryProducts_title">
//         <div onClick={() => navigate(-1)} className="left">
//           <BsChevronLeft />
//           <span>{categoryName}</span>
//         </div>
//         <div className="right">
//           <div className="form-filter">
//             <button onClick={() => setIsFilterOpen(true)}>
//               <img src={filterIcon} alt="filter icon" />
//               <span style={{ color: "#363636" }}>Фильтры</span>
//             </button>
//           </div>
//           <div className="form-sort">
//             <button onClick={() => setIsSortOpen(true)}>
//               <img src={sortIcon} alt="sort icon" />
//               <span style={{ color: "#363636" }}>Сортировка</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       <InfiniteScroll
//         dataLength={visibleProducts.length}
//         next={fetchMoreData}
//         hasMore={hasMore}
//         loader={<h4 style={{ textAlign: "center" }}>Загрузка...</h4>}
//         endMessage={
//           <p style={{ textAlign: "center" }}>
//             <b>Бошқа маҳсулотлар йўқ</b>
//           </p>
//         }
//       >
//         <div className="catalogItem_cards">
//           {visibleProducts.map((product) => {
//             const inCart = cartData.find((item) => item.id === product.id);
//             const displayQuantity = getDisplayQuantity(inCart, product);

//             return (
//               <div key={product.id} className="catalogItem_card">
//                 <Link
//                   className="product-img-link"
//                   to={`/item/${product.productTypeID}/${product.id}`}
//                 >
//                   {product.discountedPrice ? (
//                     <div className="mark_discount">%</div>
//                   ) : null}
//                   <img
//                     src={`https://shop-api.toyseller.site/api/image/${product.id}/${product.image}`}
//                     alt={product.article}
//                     className={`product-image ${
//                       isLoading ? "loading" : "loaded"
//                     }`}
//                     onLoad={() => setIsLoading(false)}
//                   />
//                   {product.isNew === 1 ? (
//                     <div className="mark_new_product">
//                       <span>Новинка</span>
//                     </div>
//                   ) : null}
//                 </Link>
//                 <p className="name">{product.name}</p>
//                 <p className="weight">Осталось: {product.remained} шт</p>
//                 <p className="weight">
//                   от {product?.recomendedMinimalSize} шт по {product?.price} ₽
//                 </p>

//                 {inCart ? (
//                   <div className="add catalog_counter">
//                     <FiMinus onClick={() => handleDecrement(product)} />
//                     <p className="amount">{displayQuantity}</p>
//                     <FiPlus onClick={() => handleIncrement(product)} />
//                   </div>
//                 ) : (
//                   <div
//                     className="price"
//                     onClick={() =>
//                       navigate(
//                         `/item/${product.productTypeID}/${product.id}`
//                       )
//                     }
//                   >
//                     {formatNumber(+product.discountedPrice)} ₽
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </InfiniteScroll>

//       <FilterModal
//         isFilterOpen={isFilterOpen}
//         setIsFilterOpen={setIsFilterOpen}
//         pendingFilters={pendingFilters}
//         setPendingFilters={setPendingFilters}
//         statusAccordionOpen={statusAccordionOpen}
//         setStatusAccordionOpen={setStatusAccordionOpen}
//         statusPriceOpen={statusPriceOpen}
//         setStatusPriceOpen={setStatusPriceOpen}
//       />

//       <SortModal
//         isSortOpen={isSortOpen}
//         setIsSortOpen={setIsSortOpen}
//         sortOrder={sortOrder}
//         setSortOrder={setSortOrder}
//         filteredProducts={filteredProducts}
//         setFilteredProducts={setFilteredProducts}
//       />
//     </div>
//   );
// }

// export default CategoryProducts;
