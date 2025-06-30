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
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
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

      const maxQuantity = inStock * (Number(inTheBox) / Number(inBox));
      if (item.quantity >= maxQuantity) return;

      const boxQuantity = Number(item.quantity) * Number(inBox);
      let incrementAmount = 1;
      if (Number(inBox) > boxQuantity) {
        incrementAmount = 1 / (Number(inBox) / Number(inPackage));
      }

      item.quantity = Number((item.quantity + incrementAmount).toFixed(2));
      saveCartToStorage(state.items); // Har bir o'zgarishdan keyin saqlash
    },
    decrementQuantity: (state, action) => {
      const { productId, inBox, inPackage, inTheBox } = action.payload;
      const item = state.items.find((item) => item.id === productId);
      if (!item || item.quantity <= 0) return;

      let minusAmount = 1;
      const boxQuantity = Number(item.quantity) * Number(inBox);
      if (Number(inBox) >= boxQuantity) {
        minusAmount = 1 / (Number(inBox) / Number(inPackage));
      } else if (Number(inBox) + Number(inTheBox) <= boxQuantity) {
        minusAmount = Number(inTheBox) / Number(inBox);
      }

      const newQuantity = Number((item.quantity - minusAmount).toFixed(2));
      if (newQuantity > 0) {
        item.quantity = newQuantity;
      } else {
        state.items = state.items.filter((item) => item.id !== productId);
      }
      saveCartToStorage(state.items); // Har bir o'zgarishdan keyin saqlash
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
