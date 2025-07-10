import { api } from "./api";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductsByType: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?type=" +
        id +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),
    getProductsBySubcategoryId: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?sub_category=" +
        id +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),
    getProductsForSinglePage: builder.query({
      query: (id) => "https://shop-api.toyseller.site/api/products?type=" + id,
    }),

    getProductsByTypeWithLimit: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?category=" +
        id +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),

    getProductsByCategoryNameWithLimit: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?category=" + id,
    }),

    getNewProducts: builder.query({
      query: (limit, offset, inStock) =>
        "https://shop-api.toyseller.site/api/products?category=-1" +
        (limit ? `&limit=${limit}` : "") +
        (offset ? `&offset=${offset}` : "") +
        (inStock ? `&in_stock=${inStock}` : ""),
    }),

    getNewProductsLazy: builder.query({
      query: ({ limit, offset, inStock }) =>
        "https://shop-api.toyseller.site/api/products?category=-1" +
        (limit ? `&limit=${limit}` : "") +
        (offset ? `&offset=${offset}` : "") +
        (inStock ? `&in_stock=${inStock}` : ""),
    }),

    getProductsBySearch: builder.query({
      query: (value) =>
        "https://shop-api.toyseller.site/api/products?query=name=" + value,
    }),

    getCategories: builder.query({
      query: () => "https://shop-api.toyseller.site/api/categories?exists=1",
    }),
    getProductsById: builder.query({
      query: (value) =>
        "https://shop-api.toyseller.site/api/products?query=id=" + value,
    }),

    // pickup points /api/pickup-points
    getPickupPoints: builder.query({
      query: () => "https://shop-api.toyseller.site/api/pickup-points",
    }),
    getProductsByBrand: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?query=tradeMarkID=" +
        id +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),
  }),
});

export const {
  useLazyGetProductsByTypeQuery,
  useLazyGetProductsBySubcategoryIdQuery,
  useLazyGetProductsForSinglePageQuery,
  useLazyGetProductsByTypeWithLimitQuery,
  useLazyGetProductsByCategoryNameWithLimitQuery,
  useGetNewProductsQuery,
  useLazyGetNewProductsLazyQuery,
  useGetProductsBySearchQuery,
  useGetCategoriesQuery,
  useLazyGetProductsByIdQuery,
  useGetPickupPointsQuery,
  useGetProductsByTypeWithLimitQuery,
  useLazyGetProductsByBrandQuery,
} = productsApi;

// а, понял, у нас происходит кеширование каталога при первом входе на сайт, что означает что все товары сохраняются
