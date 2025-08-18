import toast from "react-hot-toast";

const getProducts = async () => {
  try {
    const req = await fetch("https://shop-api.toyseller.site/api/products");
    const res = await req.json();

    return res.data;
  } catch (err) {
    if (err.status == 401) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }
};
const getProductsByType = async (id) => {
  try {
    const req = await fetch(
      "https://shop-api.toyseller.site/api/products?type=" + id
    );
    const res = await req.json();

    return res.data;
  } catch (err) {
    if (err.status == 401) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }
};
const getProductsByTypeWithLimit = async (id, limit) => {
  const req = await fetch(
    "https://shop-api.toyseller.site/api/products?category=" +
      id +
      (limit ? "&limit=" + limit : "")
  );
  const res = await req.json();

  return res.data;
};

const getNewProducts = async (limit) => {
  const req = await fetch(
    "https://shop-api.toyseller.site/api/products?category=-1" +
      "&limit=" +
      limit
  );
  const res = await req.json();

  return res.data;
};

const getProductsBySearch = async (value) => {
  const req = await fetch(
    "https://shop-api.toyseller.site/api/products?query=name=" + value
  );
  const res = await req.json();

  return res.data;
};

const getUser = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const req = await fetch("https://shop-api.toyseller.site/api/user/get/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "MiniApp",
      },
      body: JSON.stringify({
        tgUserData: user,
      }),
    });
    const res = await req.json();

    return res.data;
  } catch (err) {
    toast.error("Не удалось войти в систему, попробуйте снова.");
    localStorage.removeItem("user");
    window.location.href = "/auth";
    return null;
  }
};

const newOrder = async (data) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const req = await fetch("https://shop-api.toyseller.site/api/order/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "MiniApp",
      },
      body: JSON.stringify({
        tgUserData: user,
        ...data,
      }),
    });
    const res = await req.json();

    return res;
  } catch (err) {
    if (err.status == 401) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }
};

const payTBank = async (orderID) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const req = await fetch(
      `https://shop-api.toyseller.site/api/payment/tbank/init/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "MiniApp",
        },
        body: JSON.stringify({
          tgUserData: user,
          orderID: orderID,
        }),
      }
    );
    const res = await req.json();

    return res;
  } catch (err) {
    if (err.status == 401) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }
};

const getSingleProduct = async (id) => {
  const req = await fetch(
    `https://shop-api.toyseller.site/api/product?id=${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "MiniApp",
      },
    }
  );
  const res = await req.json();

  return res.data?.length > 0 ? res.data[0] : res.data;
};

const getCategories = async () => {
  const req = await fetch(`https://shop-api.toyseller.site/api/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: "MiniApp",
    },
  });
  const res = await req.json();

  return res.data;
};

export {
  getProducts,
  newOrder,
  payTBank,
  getUser,
  getSingleProduct,
  getCategories,
  getProductsByType,
  getProductsByTypeWithLimit,
  getNewProducts,
  getProductsBySearch,
};
