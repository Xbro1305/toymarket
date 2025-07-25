import { createSlice } from "@reduxjs/toolkit";

const loadCartFromStorage = () => {
  const savedCart = localStorage.getItem("cart");
  return savedCart ? JSON.parse(savedCart) : [];
};

const saveCartToStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

const initialState = {
  items: loadCartFromStorage(),
  userInfo: {
    name: "",
    phone: "",
    address: "",
    companyName: "",
    inn: "",
  },
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // const existingItem = state.items.find(
      //   (item) => item.id === action.payload.id
      // );
      // if (existingItem) {
      //   existingItem.quantity += 1;
      // } else {
      //   state.items.push({ ...action.payload, quantity: 1 });
      // }

      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.inPackage || 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: Number(action.payload.recomendedMinimalSize || 1),
        });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    setCart: (state, action) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
    },
    setUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
      // userInfo localStorage'ga saqlanmaydi, agar kerak bo'lsa qo'shish mumkin
    },
    incrementQuantity: (state, action) => {
      const { productId, inBox, inPackage, inStock, inTheBox } = action.payload;
      const item = state.items.find((item) => item.id === productId);
      if (!item) return;

      // const maxQuantity = inStock * (Number(inTheBox) / Number(inBox));

      // let incrementAmount = 1 / (Number(inBox) / Number(inPackage));

      // const getDisplayQuantity = (product) => {
      //   if (!product) return 0;
      //   const boxQuantity = Number(product.quantity) * Number(product.inBox);
      //   const packageSize = Number(product.inPackage);
      //   return packageSize && boxQuantity % packageSize !== 0
      //     ? Math.ceil(boxQuantity)
      //     : Math.floor(boxQuantity);
      // };

      // const newQuantity = Number(item.quantity + incrementAmount);

      // console.log(newQuantity);

      // item.quantity =
      //   getDisplayQuantity(item) < item.inStock ? newQuantity : item.quantity;

      const newQuantity = Number(item.quantity) + Number(item.inPackage || 1);

      if (item.accessabilitySettingsID != 222 && newQuantity <= 100) {
        item.quantity = newQuantity;
        saveCartToStorage(state.items);
      } else {
        if (item.quantity >= inStock) return;
        item.quantity =
          newQuantity <= item.inStock ? newQuantity : item.quantity;
        saveCartToStorage(state.items);
      }
    },
    decrementQuantity: (state, action) => {
      const { productId, inBox, inPackage, inTheBox } = action.payload;
      const item = state.items.find((item) => item.id === productId);
      if (!item || item.quantity <= 0) return;

      // let minusAmount = 1 / (Number(inBox) / Number(inPackage));
      let minusAmount = inPackage || 1;
      // const boxQuantity = Number(item.quantity) * Number(inBox);
      // if (Number(inBox) >= boxQuantity) {
      //   minusAmount = 1 / (Number(inBox) / Number(inPackage));
      // } else if (Number(inBox) + Number(inTheBox) <= boxQuantity) {
      //   minusAmount = Number(inTheBox) / Number(inBox);
      // }

      const newQuantity = Number(item.quantity - minusAmount);

      // console.log(newQuantity);

      // if (newQuantity > 0) {
      //   item.quantity = newQuantity;
      // } else {
      //   state.items = state.items.filter((item) => item.id !== productId);
      // }
      if (newQuantity > 0) {
        item.quantity = newQuantity;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
      }
      saveCartToStorage(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
  setUserInfo,
  incrementQuantity,
  decrementQuantity,
} = cartSlice.actions;
export default cartSlice.reducer;
