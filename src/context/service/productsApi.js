import { api } from "./api";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductsByType: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?type=" +
        id +
        "&in_stock=1" +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),
    getProductsBySubcategoryId: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?sub_category=" +
        id +
        "&in_stock=1" +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),
    getProductsForSinglePage: builder.query({
      query: (id) =>
        "https://shop-api.toyseller.site/api/products?type=" +
        id +
        "&in_stock=1",
    }),

    getProductsByTypeWithLimit: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?category=" +
        id +
        "&in_stock=1" +
        (limit ? "&limit=" + limit : "") +
        (offset ? "&offset=" + offset : ""),
    }),

    getProductsByCategoryNameWithLimit: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?category=" +
        id +
        "&in_stock=1",
    }),

    getNewProducts: builder.query({
      query: (limit, offset) =>
        "https://shop-api.toyseller.site/api/products?category=-1" +
        "&in_stock=1" +
        (limit ? `&limit=${limit}` : ""),
    }),

    getNewProductsLazy: builder.query({
      query: ({ limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?category=-1" +
        "&in_stock=1" +
        (limit ? `&limit=${limit}` : "") +
        (offset ? `&offset=${offset}` : ""),
    }),

    getProductsBySearch: builder.query({
      query: (value) =>
        "https://shop-api.toyseller.site/api/products?query=name=" +
        value +
        "&in_stock=1",
    }),

    getCategories: builder.query({
      query: () => "https://shop-api.toyseller.site/api/categories?in_stock=1",
    }),
    getProductsById: builder.query({
      query: (value) =>
        "https://shop-api.toyseller.site/api/products?query=id=" +
        value +
        "&in_stock=1",
    }),

    // pickup points /api/pickup-points
    getPickupPoints: builder.query({
      query: () => "https://shop-api.toyseller.site/api/pickup-points",
    }),
    getProductsByBrand: builder.query({
      query: ({ id, limit, offset }) =>
        "https://shop-api.toyseller.site/api/products?tradeMarkID=" +
        id +
        "&in_stock=1" +
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
