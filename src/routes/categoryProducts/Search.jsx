import React, { useState, useEffect } from "react";
import "./CategoryProducts.css";
import { useGetProductsBySearchQuery } from "../../context/service/productsApi";
import filterIcon from "../../img/filter.svg";
import sortIcon from "../../img/sort.svg";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity } from "../../context/cartSlice";
import { FiPlus, FiMinus } from "react-icons/fi";
import formatNumber from "../../utils/numberFormat";
import { useNavigate, Link } from "react-router-dom";
import FilterModal from "./FilterModal";
import { BsChevronLeft } from "react-icons/bs";
import SortModal from "./SortModal";
import { getDeclination } from "../../utils/getDeclination";
import { setSearchQuery } from "../../context/searchSlice";

function TypesProducts() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const searchQuery = useSelector((state) => state.search.searchQuery);
  const { data: productsData } = useGetProductsBySearchQuery(searchQuery);

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
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

  const handleSearchChange = (e) => dispatch(setSearchQuery(e.target.value));

  useEffect(() => {
    const fetchData = async () => {
      let allProducts = productsData?.data || [];
      let categoryNameTemp = allProducts?.[0]?.productTypeName;

      const processedProducts = allProducts
        .filter((p) => p.inStock && parseInt(p.inStock) !== 0)
        .reduce((unique, product) => {
          const key = `${product.color}-${product.size}`; // Deduplicate by color and size
          const exists = unique.some((p) => `${p.color}-${p.size}` === key);
          if (!exists) {
            unique.push(product);
          }
          return unique;
        }, []);

      setProducts(processedProducts);
      setCategoryName(categoryNameTemp);
      setFilteredProducts(processedProducts); // Set initially filtered products
    };

    fetchData();
  }, [searchQuery, productsData]);

  // Apply additional filters (status, price, article) and search
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
        product?.name
          ?.toLowerCase()
          ?.includes(pendingFilters.article.toLowerCase())
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

  return (
    <div className="container  categoryProducts">
      <div className="categoryProducts_title">
        <div onClick={() => navigate(-1)} className="left">
          <BsChevronLeft />
          <span>Поиск</span>
          <span className="countOfProducts">
            {getDeclination(filteredProducts?.length, [
              "товар",
              "товара",
              "товаров",
            ])}
          </span>
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
                {+product?.discountedPrice !== +product?.price ? (
                  <div className="mark_discount">%</div>
                ) : null}
                <img
                  src={`https://shop-api.toyseller.site/api/image/${product.id}/${product.image}`}
                  alt={product.article}
                  // className="picture"
                  className={`product-image ${
                    isLoading ? "loading" : "loaded"
                  }`}
                  onLoad={() => setIsLoading(false)}
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
                  {formatNumber(+product.price)} ₽
                </div>
              )}
            </div>
          );
        })}
      </div>

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

export default TypesProducts;
