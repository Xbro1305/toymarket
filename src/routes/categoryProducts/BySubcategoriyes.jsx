import React, { useState, useEffect } from "react";
import { useLazyGetProductsBySubcategoryIdQuery } from "../../context/service/productsApi";
import filterIcon from "../../img/filter.svg";
import sortIcon from "../../img/sort.svg";
import { useDispatch, useSelector } from "react-redux";
import { decrementQuantity, incrementQuantity } from "../../context/cartSlice";
import { FiPlus, FiMinus } from "react-icons/fi";
import formatNumber from "../../utils/numberFormat";
import { useNavigate, Link, useParams } from "react-router-dom";
import FilterModal from "./FilterModal";
import { BsChevronLeft } from "react-icons/bs";
import "./CategoryProducts.css";
import SortModal from "./SortModal";
import InfiniteScroll from "react-infinite-scroll-component";

function BySubcategories() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [getProductsBySubCategoryId] = useLazyGetProductsBySubcategoryIdQuery();

  const searchQuery = useSelector((state) => state.search.searchQuery);

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

  useEffect(() => {
    const fetchData = async () => {
      const { data: products1 } = await getProductsBySubCategoryId({
        id: id,
        limit,
        offset,
      });

      let products = products1?.data
        ?.filter((p) => +p?.inStock !== 0)
        ?.reduce((unique, product) => {
          const isDuplicate = unique.some((p) => {
            const { _id, id, ...pRest } = p;
            const { _id: _, id: __, ...productRest } = product;
            return JSON.stringify(pRest) === JSON.stringify(productRest);
          });

          if (!isDuplicate) {
            unique.push(product);
          }

          return unique;
        }, [])
        .reduce((unique, product) => {
          if (product.categoryID === 3) {
            const key = `${product.color}-${product.size}`;
            const exists = unique.some((p) => `${p.color}-${p.size}` === key);
            if (!exists) {
              unique.push(product);
            }
          } else {
            unique.push(product);
          }
          return unique;
        }, []);

      //   let d = filteredProducts?.length > 20 ? totalData : [];
      const updatedTotalData = [...totalData, ...products];
      setTotalData(updatedTotalData);
      setProducts(updatedTotalData);
      setFilteredProducts(updatedTotalData);
      setCategoryName(updatedTotalData?.[0]?.subCategoryName);
    };

    fetchData();
  }, [id, offset]);

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

  return (
    <div className="container  categoryProducts">
      <div className="categoryProducts_title">
        <div onClick={() => navigate(-1)} className="left">
          <BsChevronLeft />
          <span>{categoryName}</span>
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
      {filteredProducts?.length === 0 ? (
        <div className="noProducts">
          <p className="noMore">Товаров нет!</p>
        </div>
      ) : (
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
        </InfiniteScroll>
      )}

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

export default BySubcategories;
