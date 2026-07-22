import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const exist = state.items.find(
        (p) => p._id === item._id && p.size === item.size
      );
      if (exist) {
        exist.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((_, i) => i !== action.payload);
    },
    // ADDED: Decrease function jo navbar handlers ke sath sync karega
    decreaseQuantity: (state, action) => {
      const index = action.payload;
      if (state.items[index] && state.items[index].quantity > 1) {
        state.items[index].quantity -= 1;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
});


export const { addToCart, removeFromCart, decreaseQuantity, clearCart, openCart, closeCart } =
  cartSlice.actions;

export default cartSlice.reducer;