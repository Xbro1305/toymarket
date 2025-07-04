import React, { useState, useEffect } from "react";
import "./CategoryProducts.css";
import { useLazyGetProductsByCategoryNameWithLimitQuery } from "../../context/service/productsApi";
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

function CategoryProducts() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const nav = useNavigate();

  const [triggerGetProducts, { isLoading }] =
    useLazyGetProductsByCategoryNameWithLimitQuery();

  const searchQuery = useSelector((state) => state.search.searchQuery);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusAccordionOpen, setStatusAccordionOpen] = useState(false);
  const [statusPriceOpen, setStatusPriceOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    status: "all",
    priceFrom: "",
    priceTo: "",
    article: "",
  });
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("");
  const cartData = useSelector((state) => state.cart.items);
  const navigate = useNavigate();

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalData, setTotalData] = useState([]);
  const limit = 20;

  const fetchMoreData = () => {
    if (filteredProducts.length < 200) {
      setOffset(offset + 20);
    } else {
      setHasMore(false);
    }
  };

  // 1. offset ni boshlang‘ich holatga o‘rnatish (id o‘zgarganda)
  useEffect(() => {
    setOffset(0); // offset 0 bo‘lsa 20 qilamiz
    setTotalData([]); // yangi kategoriya tanlanganda eski ma'lumotlarni tozalaymiz
  }, [id]);

  // 2. Ma'lumotlarni olib kelish
  useEffect(() => {
    const fetchProducts = async () => {
      const { data: products1 } = await triggerGetProducts({
        id: id,
        limit,
        offset,
      });

      let seen = new Set();
      let seenCat3 = new Set();
      let products = [];

      products1?.data?.forEach((product) => {
        // Unikal aniqlash uchun _id va id ni olib tashlaymiz
        const { _id, id, ...rest } = product;
        const key = JSON.stringify(rest);

        if (!seen.has(key)) {
          seen.add(key);

          if (+product.categoryID === 3) {
            if (
              !products.some(
                (u) => u.modelID == product.modelID && u.color == product.color
              )
            ) {
              products.push(product);
            }
          } else {
            products.push(product);
          }

          // if (product.categoryID === 3) {
          //   const cat3Key = `${product.color}-${product.size}`;
          //   if (!seenCat3.has(cat3Key)) {
          //     seenCat3.add(cat3Key);
          //     products.push(product);
          //   }
          // } else {
          //   products.push(product);
          // }
        }
      });

      const updatedTotalData = [...totalData, ...products];

      setTotalData(updatedTotalData);
      setProducts(updatedTotalData);
      setFilteredProducts(updatedTotalData);
    };

    fetchProducts();
  }, [offset, id]);

  useEffect(() => {
    let result = [...products];

    // Apply status filter
    if (pendingFilters.status === "inStock") {
      result = result.filter((product) => product.inStock > 0);
    } else if (pendingFilters.status === "outOfStock") {
      result = result.filter((product) => product.inStock === 0);
    }

    // Apply price range filter
    if (pendingFilters.priceFrom) {
      result = result.filter(
        (product) => +product.price >= +pendingFilters.priceFrom
      );
    }
    if (pendingFilters.priceTo) {
      result = result.filter(
        (product) => +product.price <= +pendingFilters.priceTo
      );
    }

    // Apply article filter
    if (pendingFilters.article) {
      result = result.filter((product) =>
        product.article
          .toLowerCase()
          .includes(pendingFilters.article.toLowerCase())
      );
    }

    // Apply search query filter
    if (searchQuery) {
      result = result.filter((product) =>
        product.article.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [products, pendingFilters, searchQuery]);

  const getDisplayQuantity = (inCart, product) => {
    if (!inCart || !product) return 0;
    const boxQuantity = Number(inCart.quantity) * Number(product.inBox);
    const packageSize = Number(product.inPackage);
    return packageSize && boxQuantity % packageSize !== 0
      ? Math.ceil(boxQuantity)
      : Math.floor(boxQuantity);
  };

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
    dispatch(
      decrementQuantity({
        productId: product.id,
        inBox: product.inBox,
        inPackage: product.inPackage,
        inTheBox: product.inTheBox,
      })
    );
  };
  const handleSearchChange = (e) =>
    setFilteredProducts(
      filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );

  console.log(filteredProducts);

  return (
    <div className="container categoryProducts">
      <div className="categoryProducts_title">
        <div onClick={() => navigate(-1)} className="left">
          <BsChevronLeft />
          <span>{filteredProducts[0]?.categoryName}</span>
        </div>
        <input
          onChange={handleSearchChange}
          className="search_input"
          type="text"
          placeholder="Поиск...."
        />
        <div className="right">
          <div className="form-filter">
            <button onClick={() => setIsFilterOpen(true)}>
              <img src={filterIcon} alt="filter icon" />
              <span style={{ color: "#363636" }}>Фильтры</span>
            </button>
          </div>
          <div className="form-sort">
            <button onClick={() => setIsSortOpen(true)}>
              <img src={sortIcon} alt="sort icon" />
              <span style={{ color: "#363636" }}>Сортировка</span>
            </button>
          </div>
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
          {filteredProducts?.map((product, inx) => {
            const inCart = cartData.find((item) => item.id === product.id);
            const displayQuantity = getDisplayQuantity(inCart, product);

            return (
              <div key={product.id} className="catalogItem_card">
                <Link
                  className="product-img-link"
                  to={`/product/${product.productTypeID}/${product.id}`}
                >
                  {+product?.discountedPrice !== +product?.price &&
                  +product?.price &&
                  +product?.discountedPrice ? (
                    <div className="mark_discount">%</div>
                  ) : null}
                  <img
                    src={`https://shop-api.toyseller.site/api/image/${product.id}/${product.image}`}
                    alt={product.article}
                    // className="picture"
                    className={`product-image`}
                  />
                  {product.isNew === 1 ? (
                    <div className="mark_new_product">
                      <span>Новинка</span>
                    </div>
                  ) : null}
                </Link>
                <p className="name">{product.name}</p>
                <p className="weight">Осталось: {product.remained} шт</p>
                <p className="weight">
                  от {product?.recomendedMinimalSize} шт по{" "}
                  {product?.discountedPrice} ₽{" "}
                </p>

                {inCart ? (
                  <div className="add catalog_counter">
                    <FiMinus onClick={() => handleDecrement(product)} />
                    <p className="amount">{displayQuantity}</p>
                    <FiPlus onClick={() => handleIncrement(product)} />
                  </div>
                ) : (
                  <div
                    className="price"
                    onClick={() =>
                      nav(`/product/${product.productTypeID}/${product.id}`)
                    }
                  >
                    {formatNumber(+product.price || +product.discountedPrice)} ₽
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
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
