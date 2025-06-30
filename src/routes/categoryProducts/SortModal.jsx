import React from "react";

const SortModal = ({
  isSortOpen,
  setIsSortOpen,
  sortOrder,
  setSortOrder,
  filteredProducts,
  setFilteredProducts,
}) => {
  if (!isSortOpen) return null;

  // Dinamik sort funksiyalari (obyekt orqali)
  const sortFunctions = {
    priceAsc: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    priceDesc: (a, b) => parseFloat(b.price) - parseFloat(a.price),
    newest: (a, b) => parseInt(b.id) - parseInt(a.id),
    oldest: (a, b) => parseInt(a.id) - parseInt(b.id),
    bestsellers: (a, b) => parseInt(a.inBox) - parseInt(b.inBox),
  };

  // Sortni qo‘llash funksiyasi
  const applySort = () => {
    let sortedProducts = [...filteredProducts]; // Original arrayni o‘zgartirmaslik uchun
    const sortFunction = sortFunctions[sortOrder] || ((a, b) => 0); // Default: o‘zgarishsiz
    sortedProducts.sort(sortFunction);
    setFilteredProducts(sortedProducts);
    setIsSortOpen(false); // Modalni yopish
  };

  return (
    <div className="modal-container">
      <div className="modal-overlay" onClick={() => setIsSortOpen(false)}></div>
      <div className="modal-content">
        <form>
          <div className="modal-header">
            <h3>Сортировка</h3>
            <button
              className="close-button"
              onClick={() => setIsSortOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path
                  fill="currentColor"
                  d="M18 6.41L16.59 5 12 9.59 7.41 5 6 6.41 10.59 11 6 15.59 7.41 17 12 12.41 16.59 17 18 15.59 13.41 11z"
                />
              </svg>
            </button>
          </div>

          <div className="form-group-radio">
            <input
              type="radio"
              value="priceAsc"
              name="sortOrder"
              id="priceAsc"
              checked={sortOrder === "priceAsc"}
              onChange={() => setSortOrder("priceAsc")}
            />
            <label htmlFor="priceAsc">Цене (по возрастанию)</label>
            <input
              type="radio"
              value="priceDesc"
              name="sortOrder"
              id="priceDesc"
              checked={sortOrder === "priceDesc"}
              onChange={() => setSortOrder("priceDesc")}
            />
            <label htmlFor="priceDesc">Цене (по убыванию)</label>
            <input
              type="radio"
              value="bestsellers"
              name="sortOrder"
              id="bestsellers"
              checked={sortOrder === "bestsellers"}
              onChange={() => setSortOrder("bestsellers")}
            />
            <label htmlFor="bestsellers">Бестселлеры</label>
            <input
              type="radio"
              value="newest"
              name="sortOrder"
              id="newest"
              checked={sortOrder === "newest"}
              onChange={() => setSortOrder("newest")}
            />
            <label htmlFor="newest">Недавно добавленные</label>
            <input
              type="radio"
              value="oldest"
              name="sortOrder"
              id="oldest"
              checked={sortOrder === "oldest"}
              onChange={() => setSortOrder("oldest")}
            />
            <label htmlFor="oldest">Давно добавленные</label>
          </div>

          <button type="button" className="formButton" onClick={applySort}>
            Применить
          </button>
        </form>
      </div>
    </div>
  );
};

export default SortModal;
